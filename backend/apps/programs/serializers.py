"""Sérialiseurs de l'app programs."""
from django.db import transaction
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.catalog.models import Exercise
from apps.catalog.serializers import ExerciseSerializer

from .models import (
    ExercisePrescription,
    Program,
    ProgramDay,
    ProgramEnrollment,
)


# --------------------------------------------------------------------------
# Lecture des prescriptions / jours / programme
# --------------------------------------------------------------------------
class ExercisePrescriptionSerializer(serializers.ModelSerializer):
    """Prescription en lecture (exercice imbriqué)."""

    exercise = ExerciseSerializer(read_only=True)

    class Meta:
        model = ExercisePrescription
        fields = ["id", "exercise", "sets", "reps", "charge", "rest_s", "order"]


class ProgramDaySerializer(serializers.ModelSerializer):
    """Jour de programme avec ses prescriptions."""

    exercises = ExercisePrescriptionSerializer(
        source="prescriptions", many=True, read_only=True
    )

    class Meta:
        model = ProgramDay
        fields = ["id", "title", "weekday", "order", "exercises"]


class ProgramSerializer(serializers.ModelSerializer):
    """Détail d'un programme (jours + exercices)."""

    days = ProgramDaySerializer(many=True, read_only=True)
    enrollments_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Program
        fields = [
            "id",
            "title",
            "description",
            "kind",
            "objective",
            "level",
            "duration_days",
            "is_shared",
            "is_active",
            "generated_by",
            "summary",
            "gym",
            "owner_coach",
            "enrollments_count",
            "created_at",
            "days",
        ]
        read_only_fields = fields


# --------------------------------------------------------------------------
# Écriture d'un programme coaché (days + exercises imbriqués)
# --------------------------------------------------------------------------
class PrescriptionWriteSerializer(serializers.Serializer):
    exercise_id = serializers.PrimaryKeyRelatedField(
        queryset=Exercise.objects.all(), source="exercise"
    )
    sets = serializers.IntegerField(min_value=1, default=3)
    reps = serializers.IntegerField(min_value=1, default=10)
    charge = serializers.CharField(max_length=50, required=False, allow_blank=True)
    rest_s = serializers.IntegerField(min_value=0, default=90)
    order = serializers.IntegerField(min_value=0, default=0)


class ProgramDayWriteSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=150)
    weekday = serializers.IntegerField(
        min_value=1, max_value=7, required=False, allow_null=True
    )
    order = serializers.IntegerField(min_value=0, default=0)
    exercises = PrescriptionWriteSerializer(many=True, required=False)


class ProgramCreateSerializer(serializers.ModelSerializer):
    """Création d'un programme coaché (kind=coach_shared forcé)."""

    days = ProgramDayWriteSerializer(many=True, required=False)

    class Meta:
        model = Program
        fields = [
            "id",
            "title",
            "description",
            "duration_days",
            "objective",
            "level",
            "gym",
            "summary",
            "days",
        ]

    @transaction.atomic
    def create(self, validated_data):
        days_data = validated_data.pop("days", [])
        coach = self.context["request"].user
        program = Program.objects.create(
            owner_coach=coach,
            kind=Program.Kind.COACH_SHARED,
            is_shared=True,
            generated_by=Program.GeneratedBy.COACH,
            member=None,
            **validated_data,
        )
        for day in days_data:
            exercises = day.pop("exercises", [])
            program_day = ProgramDay.objects.create(program=program, **day)
            for presc in exercises:
                ExercisePrescription.objects.create(
                    program_day=program_day, **presc
                )
        return program

    def to_representation(self, instance):
        return ProgramSerializer(instance, context=self.context).data


# --------------------------------------------------------------------------
# Adhésions
# --------------------------------------------------------------------------
class EnrollmentProgramSerializer(serializers.ModelSerializer):
    """Résumé de programme imbriqué dans une adhésion."""

    class Meta:
        model = Program
        fields = ["id", "title"]


class EnrollmentSerializer(serializers.ModelSerializer):
    """Détail d'une adhésion (progression, jours restants)."""

    program = EnrollmentProgramSerializer(read_only=True)
    adherence_pct = serializers.IntegerField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProgramEnrollment
        fields = [
            "id",
            "program",
            "start_date",
            "end_date",
            "status",
            "sessions_done",
            "sessions_target",
            "adherence_pct",
            "days_remaining",
            "created_at",
        ]
        read_only_fields = fields


class AdherentMemberSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.CharField()


class AdherentSerializer(serializers.ModelSerializer):
    """Ligne d'adhérent pour la vue coach (member + assiduité)."""

    member = serializers.SerializerMethodField()
    adherence_pct = serializers.IntegerField(read_only=True)

    class Meta:
        model = ProgramEnrollment
        fields = [
            "id",
            "member",
            "status",
            "sessions_done",
            "sessions_target",
            "adherence_pct",
        ]

    @extend_schema_field(AdherentMemberSerializer)
    def get_member(self, obj):
        return {"id": obj.member_id, "full_name": obj.member.full_name}
