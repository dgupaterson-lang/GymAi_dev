"""Commande de seed : données de démo (admin, coach, membre David, salles).

Étendue (Sprint 2) : catalogue d'exercices, programme coaché « Défi 30 jours »
appartenant au coach, et une invitation pending pour David. Idempotente.
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

User = get_user_model()

# Les 4 exercices de web/src/data.ts (lecture seule).
DEMO_EXERCISES = [
    {
        "name": "Développé couché",
        "muscle": "Pectoraux",
        "default_sets": 4,
        "default_reps": 10,
        "default_rest_s": 90,
        "charge_hint": "60 kg",
    },
    {
        "name": "Écarté à la poulie",
        "muscle": "Pectoraux",
        "default_sets": 3,
        "default_reps": 12,
        "default_rest_s": 75,
        "charge_hint": "15 kg",
    },
    {
        "name": "Dips lestés",
        "muscle": "Triceps",
        "default_sets": 3,
        "default_reps": 8,
        "default_rest_s": 90,
        "charge_hint": "+10 kg",
    },
    {
        "name": "Extension triceps poulie",
        "muscle": "Triceps",
        "default_sets": 3,
        "default_reps": 14,
        "default_rest_s": 60,
        "charge_hint": "25 kg",
    },
]


class Command(BaseCommand):
    help = "Crée des données de démo : 1 admin, 1 coach, 1 membre (David) + 3 salles."

    @transaction.atomic
    def handle(self, *args, **options):
        # --- Utilisateurs ---
        admin = self._upsert_user(
            email="admin@email.com",
            full_name="Admin GymAI",
            role="admin",
            password="admin1234",
            is_staff=True,
            is_superuser=True,
            is_verified=True,
        )
        self.stdout.write(self.style.SUCCESS(f"Admin : {admin.email}"))

        coach = self._upsert_user(
            email="coach@email.com",
            full_name="Coach Alex",
            role="coach",
            password="coach1234",
            is_verified=True,
        )
        self.stdout.write(self.style.SUCCESS(f"Coach : {coach.email}"))

        david = self._upsert_user(
            email="david@email.com",
            full_name="David",
            role="member",
            password="david1234",
            is_verified=True,
        )
        # Profil de David : accent cyan + préférences de démo.
        profile = david.profile
        profile.accent_color = "#5fe3f0"  # cyan
        profile.theme_mode = "dark"
        profile.objective = "Prendre du muscle"
        profile.level = "Intermédiaire"
        profile.weekly_freq = 4
        profile.voice_cues = True
        profile.height_cm = 180
        profile.save()
        self.stdout.write(
            self.style.SUCCESS(f"Membre : {david.email} (accent {profile.accent_color})")
        )

        # --- Salles (si l'app gyms a un modèle Gym) ---
        gyms = self._seed_gyms()

        # --- Catalogue d'exercices ---
        exercises = self._seed_exercises()

        # --- Programme coaché + invitation pending pour David ---
        self._seed_program_and_invitation(coach, david, exercises, gyms)

        self.stdout.write(self.style.SUCCESS("Seed de démo terminé."))

    # ------------------------------------------------------------------
    def _upsert_user(self, email, password, **fields):
        user, created = User.objects.get_or_create(
            email=email, defaults=fields
        )
        if not created:
            for key, value in fields.items():
                setattr(user, key, value)
        user.set_password(password)
        user.save()
        return user

    def _seed_gyms(self):
        try:
            from apps.gyms.models import Gym
        except (ImportError, LookupError):
            self.stdout.write(
                self.style.WARNING("App gyms sans modèle Gym : salles ignorées.")
            )
            return []

        gyms = [
            {"name": "GymAI Plateau", "city": "Abidjan", "address": "Plateau", "rating": "4.9"},
            {"name": "GymAI Cocody", "city": "Abidjan", "address": "Cocody", "rating": "4.7"},
            {"name": "GymAI Marcory", "city": "Abidjan", "address": "Marcory", "rating": "4.8"},
        ]
        created_gyms = []
        for g in gyms:
            obj, created = Gym.objects.get_or_create(
                name=g["name"], defaults=g
            )
            created_gyms.append(obj)
            verb = "créée" if created else "déjà présente"
            self.stdout.write(self.style.SUCCESS(f"Salle {obj.name} {verb}."))
        return created_gyms

    def _seed_exercises(self):
        from apps.catalog.models import Exercise

        exercises = {}
        for data in DEMO_EXERCISES:
            obj, created = Exercise.objects.get_or_create(
                name=data["name"], defaults=data
            )
            exercises[obj.name] = obj
            verb = "créé" if created else "déjà présent"
            self.stdout.write(self.style.SUCCESS(f"Exercice {obj.name} {verb}."))
        return exercises

    def _seed_program_and_invitation(self, coach, david, exercises, gyms):
        from apps.invitations.models import Invitation
        from apps.programs.models import (
            ExercisePrescription,
            Program,
            ProgramDay,
        )

        gym = gyms[0] if gyms else None
        program, created = Program.objects.get_or_create(
            title="Défi 30 jours — Prise de masse",
            owner_coach=coach,
            defaults={
                "description": "Programme coaché suivi sur 1 mois.",
                "kind": Program.Kind.COACH_SHARED,
                "objective": "Prendre du muscle",
                "level": "Intermédiaire",
                "duration_days": 30,
                "is_shared": True,
                "is_active": True,
                "generated_by": Program.GeneratedBy.COACH,
                "member": None,
                "gym": gym,
            },
        )
        if created:
            days_spec = [
                (
                    "Pectoraux & Triceps",
                    1,
                    0,
                    [
                        ("Développé couché", 4, 10, "60 kg", 90),
                        ("Écarté à la poulie", 3, 12, "15 kg", 75),
                    ],
                ),
                (
                    "Triceps & Finitions",
                    3,
                    1,
                    [
                        ("Dips lestés", 3, 8, "+10 kg", 90),
                        ("Extension triceps poulie", 3, 14, "25 kg", 60),
                    ],
                ),
            ]
            for title, weekday, order, prescs in days_spec:
                day = ProgramDay.objects.create(
                    program=program, title=title, weekday=weekday, order=order
                )
                for i, (ex_name, sets, reps, charge, rest_s) in enumerate(prescs):
                    ExercisePrescription.objects.create(
                        program_day=day,
                        exercise=exercises[ex_name],
                        sets=sets,
                        reps=reps,
                        charge=charge,
                        rest_s=rest_s,
                        order=i,
                    )
            self.stdout.write(
                self.style.SUCCESS(f"Programme coaché « {program.title} » créé.")
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Programme coaché « {program.title} » déjà présent."
                )
            )

        # Invitation pending pour David (ne pas l'inscrire automatiquement).
        invitation, inv_created = Invitation.objects.get_or_create(
            from_coach=coach,
            program=program,
            member=david,
            target_type=Invitation.TargetType.MEMBER,
            defaults={
                "kind": Invitation.Kind.PROGRAM,
                "status": Invitation.Status.PENDING,
            },
        )
        # Réarme l'invitation si un ancien seed l'avait déjà acceptée/expirée.
        if not inv_created and invitation.status != Invitation.Status.PENDING:
            invitation.status = Invitation.Status.PENDING
            invitation.accepted_by = None
            invitation.save(update_fields=["status", "accepted_by"])
        verb = "créée" if inv_created else "déjà présente"
        self.stdout.write(
            self.style.SUCCESS(
                f"Invitation pending pour {david.email} {verb} "
                f"(token {invitation.token})."
            )
        )
