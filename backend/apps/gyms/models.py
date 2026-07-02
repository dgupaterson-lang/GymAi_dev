"""Modèle minimal Gym (salle de sport). Complété aux sprints suivants."""
from django.db import models


class Gym(models.Model):
    """Salle de sport (modèle minimal pour le seed de démo)."""

    name = models.CharField("nom", max_length=120)
    address = models.CharField("adresse", max_length=255, blank=True)
    city = models.CharField("ville", max_length=120, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    rating = models.DecimalField(
        "note", max_digits=2, decimal_places=1, null=True, blank=True
    )
    photo = models.ImageField("photo", upload_to="gyms/", null=True, blank=True)
    opening_hours = models.JSONField("horaires", default=dict, blank=True)
    is_active = models.BooleanField("active", default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "salle"
        verbose_name_plural = "salles"
        ordering = ["name"]

    def __str__(self):
        return self.name
