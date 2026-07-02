"""Sérialiseurs de l'app invitations."""
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.programs.models import Program

from .models import Invitation

User = get_user_model()


class InvitationProgramSummarySerializer(serializers.Serializer):
    """Résumé de programme joint à la résolution d'une invitation."""

    id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    duration_days = serializers.IntegerField()
    objective = serializers.CharField()
    level = serializers.CharField()


class InvitationCreateSerializer(serializers.ModelSerializer):
    """Création d'une invitation par un coach (kind program/group)."""

    program_id = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(),
        source="program",
        required=False,
        allow_null=True,
    )
    member_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="member",
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Invitation
        fields = [
            "id",
            "kind",
            "program_id",
            "group_id",
            "target_type",
            "member_id",
            "contact",
        ]

    def validate(self, attrs):
        kind = attrs.get("kind", Invitation.Kind.PROGRAM)
        target_type = attrs.get("target_type", Invitation.TargetType.MEMBER)

        if kind == Invitation.Kind.PROGRAM and not attrs.get("program"):
            raise serializers.ValidationError(
                {"program_id": "Requis pour une invitation à un programme."}
            )
        if kind == Invitation.Kind.GROUP and not attrs.get("group_id"):
            raise serializers.ValidationError(
                {"group_id": "Requis pour une invitation à un groupe."}
            )

        if target_type == Invitation.TargetType.MEMBER and not attrs.get("member"):
            raise serializers.ValidationError(
                {"member_id": "Requis pour une cible de type 'member'."}
            )
        if target_type == Invitation.TargetType.CONTACT and not attrs.get("contact"):
            raise serializers.ValidationError(
                {"contact": "Requis pour une cible de type 'contact'."}
            )

        # Le coach ne peut inviter que sur ses propres programmes.
        program = attrs.get("program")
        coach = self.context["request"].user
        if program and program.owner_coach_id != coach.id:
            raise serializers.ValidationError(
                {"program_id": "Ce programme ne vous appartient pas."}
            )
        return attrs

    def create(self, validated_data):
        coach = self.context["request"].user
        return Invitation.objects.create(from_coach=coach, **validated_data)

    def to_representation(self, instance):
        return InvitationResultSerializer(instance, context=self.context).data


class InvitationResultSerializer(serializers.ModelSerializer):
    """Réponse renvoyée après création (token + url + expires_at)."""

    url = serializers.CharField(source="deep_link", read_only=True)

    class Meta:
        model = Invitation
        fields = ["id", "token", "url", "status", "expires_at", "kind"]
        read_only_fields = fields


class InvitationListSerializer(serializers.ModelSerializer):
    """Invitation en liste (vue coach)."""

    url = serializers.CharField(source="deep_link", read_only=True)

    class Meta:
        model = Invitation
        fields = [
            "id",
            "kind",
            "program",
            "group_id",
            "target_type",
            "member",
            "contact",
            "token",
            "url",
            "status",
            "expires_at",
            "accepted_by",
            "created_at",
        ]
        read_only_fields = fields


class InvitationResolveSerializer(serializers.ModelSerializer):
    """Résolution d'une invitation par token (résumé programme + statut)."""

    program = serializers.SerializerMethodField()
    url = serializers.CharField(source="deep_link", read_only=True)

    class Meta:
        model = Invitation
        fields = [
            "token",
            "kind",
            "status",
            "expires_at",
            "url",
            "program",
        ]
        read_only_fields = fields

    @extend_schema_field(InvitationProgramSummarySerializer)
    def get_program(self, obj):
        if not obj.program_id:
            return None
        p = obj.program
        return {
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "duration_days": p.duration_days,
            "objective": p.objective,
            "level": p.level,
        }
