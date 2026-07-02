"""Vues de l'app invitations : création (coach), listing, résolution & acceptation."""
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.programs.models import Program
from apps.programs.permissions import IsCoachOrManager
from apps.programs.serializers import EnrollmentSerializer
from apps.programs.views import enroll_member

from .models import Invitation
from .serializers import (
    InvitationCreateSerializer,
    InvitationListSerializer,
    InvitationResolveSerializer,
)


class InvitationCreateView(generics.CreateAPIView):
    """POST /invitations — crée une invitation (coach) → token + url + expires_at."""

    serializer_class = InvitationCreateSerializer
    permission_classes = [IsCoachOrManager]


class CoachInvitationsView(generics.ListAPIView):
    """GET /coach/invitations?program={id} — invitations + stats conversion."""

    serializer_class = InvitationListSerializer
    permission_classes = [IsCoachOrManager]

    def get_queryset(self):
        qs = Invitation.objects.filter(from_coach=self.request.user)
        program = self.request.query_params.get("program")
        if program:
            qs = qs.filter(program_id=program)
        return qs.select_related("member", "program", "accepted_by").order_by(
            "-created_at"
        )

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="program", type=int, required=False,
                description="Filtre par programme.",
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        qs = self.filter_queryset(self.get_queryset())
        sent = qs.count()
        accepted = qs.filter(status=Invitation.Status.ACCEPTED).count()
        # Enrichit la réponse paginée avec les stats de conversion.
        data = response.data
        if isinstance(data, dict):
            data["stats"] = {"sent": sent, "accepted": accepted}
        else:
            data = {"results": data, "stats": {"sent": sent, "accepted": accepted}}
        return Response(data)


class InvitationResolveView(APIView):
    """GET /invitations/{token} — résout une invitation (résumé + statut)."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: InvitationResolveSerializer})
    def get(self, request, token):
        invitation = generics.get_object_or_404(Invitation, token=token)
        # Bascule en 'expired' au vol si nécessaire.
        new_status = invitation.refresh_status()
        if new_status == Invitation.Status.EXPIRED and invitation.pk:
            Invitation.objects.filter(pk=invitation.pk).update(
                status=Invitation.Status.EXPIRED
            )
        serializer = InvitationResolveSerializer(
            invitation, context={"request": request}
        )
        return Response(serializer.data)


class InvitationAcceptView(APIView):
    """POST /invitations/{token}/accept — accepte → auto-enroll (RG-58)."""

    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses={201: EnrollmentSerializer})
    def post(self, request, token):
        invitation = generics.get_object_or_404(Invitation, token=token)

        if invitation.refresh_status() == Invitation.Status.EXPIRED:
            Invitation.objects.filter(pk=invitation.pk).update(
                status=Invitation.Status.EXPIRED
            )
            return Response(
                {"detail": "Cette invitation a expiré."},
                status=status.HTTP_410_GONE,
            )

        if invitation.kind != Invitation.Kind.PROGRAM or not invitation.program_id:
            return Response(
                {"detail": "Seules les invitations à un programme sont supportées (MVP)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        program = invitation.program
        enrollment, created = enroll_member(program, request.user)

        # Marque l'invitation acceptée (idempotent).
        if invitation.status != Invitation.Status.ACCEPTED:
            invitation.status = Invitation.Status.ACCEPTED
            invitation.accepted_by = request.user
            invitation.save(update_fields=["status", "accepted_by"])

        serializer = EnrollmentSerializer(enrollment, context={"request": request})
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=code)
