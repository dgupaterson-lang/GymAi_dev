"""Sérialiseurs de l'app catalog."""
from rest_framework import serializers

from .models import Exercise


class ExerciseSerializer(serializers.ModelSerializer):
    """Représentation d'un exercice du catalogue."""

    class Meta:
        model = Exercise
        fields = [
            "id",
            "name",
            "muscle",
            "default_sets",
            "default_reps",
            "default_rest_s",
            "charge_hint",
            "video_url",
            "thumbnail",
        ]
