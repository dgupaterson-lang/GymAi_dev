"""Modèles de l'app programs : programmes (perso/coachés), jours, prescriptions, adhésions."""
import math
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone


class Program(models.Model):
    """Programme d'entraînement (perso IA ou coaché partageable).

    Programme coaché = kind=coach_shared, owner_coach défini, is_shared=True, member=null.
    """

    class Kind(models.TextChoices):
        PERSONAL = "personal", "Personnel"
        COACH_SHARED = "coach_shared", "Coaché partagé"

    class GeneratedBy(models.TextChoices):
        AI = "ai", "IA"
        COACH = "coach", "Coach"

    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="programs",
        null=True,
        blank=True,
        help_text="null = template partagé non assigné.",
    )
    owner_coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coached_programs",
        null=True,
        blank=True,
    )
    gym = models.ForeignKey(
        "gyms.Gym",
        on_delete=models.SET_NULL,
        related_name="programs",
        null=True,
        blank=True,
    )

    title = models.CharField("titre", max_length=150)
    description = models.TextField("description", blank=True)
    kind = models.CharField(
        "type", max_length=20, choices=Kind.choices, default=Kind.PERSONAL
    )
    objective = models.CharField("objectif", max_length=100, blank=True)
    level = models.CharField("niveau", max_length=30, blank=True)
    duration_days = models.PositiveSmallIntegerField("durée (jours)", default=30)
    is_shared = models.BooleanField("partagé", default=False)
    is_active = models.BooleanField("actif", default=True)
    generated_by = models.CharField(
        "généré par",
        max_length=10,
        choices=GeneratedBy.choices,
        default=GeneratedBy.COACH,
    )
    summary = models.TextField("résumé", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "programme"
        verbose_name_plural = "programmes"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def enrollments_count(self):
        return self.enrollments.count()


class ProgramDay(models.Model):
    """Jour d'entraînement d'un programme."""

    program = models.ForeignKey(
        Program, on_delete=models.CASCADE, related_name="days"
    )
    title = models.CharField("titre", max_length=150)
    weekday = models.PositiveSmallIntegerField(
        "jour de la semaine", null=True, blank=True, help_text="1=lundi … 7=dimanche"
    )
    order = models.PositiveSmallIntegerField("ordre", default=0)

    class Meta:
        verbose_name = "jour de programme"
        verbose_name_plural = "jours de programme"
        ordering = ["program", "order"]

    def __str__(self):
        return f"{self.program.title} — {self.title}"


class ExercisePrescription(models.Model):
    """Prescription d'un exercice dans un jour de programme."""

    program_day = models.ForeignKey(
        ProgramDay, on_delete=models.CASCADE, related_name="prescriptions"
    )
    exercise = models.ForeignKey(
        "catalog.Exercise", on_delete=models.PROTECT, related_name="prescriptions"
    )
    sets = models.PositiveSmallIntegerField("séries", default=3)
    reps = models.PositiveSmallIntegerField("répétitions", default=10)
    charge = models.CharField("charge", max_length=50, blank=True)
    rest_s = models.PositiveSmallIntegerField("repos (s)", default=90)
    order = models.PositiveSmallIntegerField("ordre", default=0)

    class Meta:
        verbose_name = "prescription d'exercice"
        verbose_name_plural = "prescriptions d'exercices"
        ordering = ["program_day", "order"]

    def __str__(self):
        return f"{self.exercise.name} ({self.sets}x{self.reps})"


class ProgramEnrollment(models.Model):
    """Adhésion d'un membre à un programme coaché, avec suivi d'assiduité."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Terminée"
        DROPPED = "dropped", "Abandonnée"

    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    program = models.ForeignKey(
        Program, on_delete=models.CASCADE, related_name="enrollments"
    )
    coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="coached_enrollments",
        null=True,
        blank=True,
    )
    start_date = models.DateField("début")
    end_date = models.DateField("fin")
    status = models.CharField(
        "statut", max_length=10, choices=Status.choices, default=Status.ACTIVE
    )
    sessions_done = models.PositiveSmallIntegerField("séances faites", default=0)
    sessions_target = models.PositiveSmallIntegerField("séances prévues", default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "adhésion"
        verbose_name_plural = "adhésions"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["member", "program", "start_date"],
                name="unique_enrollment_member_program_start",
            )
        ]

    def __str__(self):
        return f"{self.member} → {self.program.title}"

    @property
    def adherence_pct(self):
        return round(100 * self.sessions_done / max(self.sessions_target, 1))

    @property
    def days_remaining(self):
        today = timezone.localdate()
        return max((self.end_date - today).days, 0)

    @staticmethod
    def compute_sessions_target(program):
        """sessions_target = nb_ProgramDay × ceil(duration_days/7)."""
        n_days = program.days.count()
        weeks = math.ceil(max(program.duration_days, 1) / 7)
        return n_days * weeks

    @staticmethod
    def compute_end_date(start_date, duration_days):
        return start_date + timedelta(days=duration_days)
