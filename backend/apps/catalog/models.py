"""Modèles de l'app catalog : catalogue d'exercices (minimal MVP)."""
from django.db import models


class Exercise(models.Model):
    """Exercice du catalogue, réutilisé dans les prescriptions de programmes."""

    name = models.CharField("nom", max_length=150)
    muscle = models.CharField("muscle", max_length=80, blank=True)
    default_sets = models.PositiveSmallIntegerField("séries par défaut", default=3)
    default_reps = models.PositiveSmallIntegerField("répétitions par défaut", default=10)
    default_rest_s = models.PositiveSmallIntegerField(
        "repos par défaut (s)", default=90
    )
    charge_hint = models.CharField("indication de charge", max_length=50, blank=True)
    video_url = models.URLField("vidéo", blank=True)
    thumbnail = models.ImageField(
        "vignette", upload_to="exercises/", null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "exercice"
        verbose_name_plural = "exercices"
        ordering = ["name"]

    def __str__(self):
        return self.name
