"""Vues de l'app programs : coach (programmes/adhérents) & membre (adhésions)."""
from django.db.models import Prefetch
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    ExercisePrescription,
    Program,
    ProgramDay,
    ProgramEnrollment,
)
from .permissions import (
    IsCoachOrManager,
    IsEnrollmentOwner,
    IsProgramOwnerCoach,
)
from .serializers import (
    AdherentSerializer,
    EnrollmentSerializer,
    ProgramCreateSerializer,
    ProgramSerializer,
)

# Prefetch réutilisable : jours ordonnés + prescriptions ordonnées + exercice.
_DAYS_PREFETCH = Prefetch(
    "days",
    queryset=ProgramDay.objects.order_by("order").prefetch_related(
        Prefetch(
            "prescriptions",
            queryset=ExercisePrescription.objects.order_by("order").select_related(
                "exercise"
            ),
        )
    ),
)


# ==========================================================================
# Côté coach
# ==========================================================================
class CoachProgramListCreateView(generics.ListCreateAPIView):
    """GET/POST /coach/programs — liste/crée mes programmes coachés."""

    permission_classes = [IsCoachOrManager]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProgramCreateSerializer
        return ProgramSerializer

    def get_queryset(self):
        return (
            Program.objects.filter(
                owner_coach=self.request.user, kind=Program.Kind.COACH_SHARED
            )
            .prefetch_related(_DAYS_PREFETCH)
            .order_by("-created_at")
        )


class CoachProgramDetailView(generics.RetrieveAPIView):
    """GET /coach/programs/{id} — détail + enrollments_count."""

    serializer_class = ProgramSerializer
    permission_classes = [IsProgramOwnerCoach]

    def get_queryset(self):
        return Program.objects.filter(
            owner_coach=self.request.user
        ).prefetch_related(_DAYS_PREFETCH)


class CoachProgramAdherentsView(generics.ListAPIView):
    """GET /coach/programs/{id}/adherents — adhésions + adherence_pct."""

    serializer_class = AdherentSerializer
    permission_classes = [IsProgramOwnerCoach]

    def get_program(self):
        program = generics.get_object_or_404(
            Program, pk=self.kwargs["pk"]
        )
        self.check_object_permissions(self.request, program)
        return program

    def get_queryset(self):
        program = self.get_program()
        return (
            ProgramEnrollment.objects.filter(program=program)
            .select_related("member")
            .order_by("-created_at")
        )


# ==========================================================================
# Côté membre
# ==========================================================================
class CoachedProgramsView(generics.ListAPIView):
    """GET /programs/coached?gym={id} — programmes coachés découvrables."""

    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="gym", type=int, required=False, description="Filtre par salle."
            )
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        qs = Program.objects.filter(
            kind=Program.Kind.COACH_SHARED, is_shared=True, is_active=True
        ).prefetch_related(_DAYS_PREFETCH)
        gym = self.request.query_params.get("gym")
        if gym:
            qs = qs.filter(gym_id=gym)
        return qs.order_by("-created_at")


class ProgramDetailView(generics.RetrieveAPIView):
    """GET /programs/{id} — détail d'un programme coaché (jours + exercices)."""

    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Program.objects.filter(
            kind=Program.Kind.COACH_SHARED, is_shared=True
        ).prefetch_related(_DAYS_PREFETCH)


def enroll_member(program, member):
    """Crée (ou récupère) l'adhésion d'un membre à un programme coaché.

    Calcule end_date et sessions_target. Idempotent pour (member, program, start_date).
    Renvoie (enrollment, created).
    """
    today = timezone.localdate()
    existing = ProgramEnrollment.objects.filter(
        member=member, program=program, start_date=today
    ).first()
    if existing:
        return existing, False
    end_date = ProgramEnrollment.compute_end_date(today, program.duration_days)
    target = ProgramEnrollment.compute_sessions_target(program)
    enrollment = ProgramEnrollment.objects.create(
        member=member,
        program=program,
        coach=program.owner_coach,
        start_date=today,
        end_date=end_date,
        sessions_target=target,
        status=ProgramEnrollment.Status.ACTIVE,
    )
    return enrollment, True


class ProgramEnrollView(APIView):
    """POST /programs/{id}/enroll — adhésion (start=aujourd'hui, end=+duration)."""

    permission_classes = [IsAuthenticated]

    @extend_schema(request=None, responses={201: EnrollmentSerializer})
    def post(self, request, pk):
        program = generics.get_object_or_404(
            Program,
            pk=pk,
            kind=Program.Kind.COACH_SHARED,
            is_shared=True,
        )
        enrollment, created = enroll_member(program, request.user)
        serializer = EnrollmentSerializer(enrollment, context={"request": request})
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=code)


class MyEnrollmentsView(generics.ListAPIView):
    """GET /me/enrollments — mes adhésions + progression."""

    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            ProgramEnrollment.objects.filter(member=self.request.user)
            .select_related("program")
            .order_by("-created_at")
        )


class EnrollmentDetailView(generics.RetrieveAPIView):
    """GET /enrollments/{id} — détail adhésion (adherence, jours restants)."""

    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated, IsEnrollmentOwner]
    queryset = ProgramEnrollment.objects.select_related("program", "member")


class LogSessionView(APIView):
    """POST /enrollments/{id}/log-session — incrémente sessions_done (borné)."""

    permission_classes = [IsAuthenticated, IsEnrollmentOwner]

    @extend_schema(request=None, responses={200: EnrollmentSerializer})
    def post(self, request, pk):
        enrollment = generics.get_object_or_404(
            ProgramEnrollment.objects.select_related("program", "member"), pk=pk
        )
        self.check_object_permissions(request, enrollment)
        # Borné au nombre de séances prévues (MVP du suivi).
        if enrollment.sessions_done < enrollment.sessions_target:
            enrollment.sessions_done += 1
            if enrollment.sessions_done >= enrollment.sessions_target:
                enrollment.status = ProgramEnrollment.Status.COMPLETED
            enrollment.save(update_fields=["sessions_done", "status"])
        serializer = EnrollmentSerializer(enrollment, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
