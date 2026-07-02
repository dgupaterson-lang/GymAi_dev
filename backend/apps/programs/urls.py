"""URLs de l'app programs (montées sous /api/v1/)."""
from django.urls import path

from .views import (
    CoachProgramAdherentsView,
    CoachProgramDetailView,
    CoachProgramListCreateView,
    CoachedProgramsView,
    EnrollmentDetailView,
    LogSessionView,
    MyEnrollmentsView,
    ProgramDetailView,
    ProgramEnrollView,
)

urlpatterns = [
    # Coach
    path(
        "coach/programs",
        CoachProgramListCreateView.as_view(),
        name="coach-programs",
    ),
    path(
        "coach/programs/<int:pk>",
        CoachProgramDetailView.as_view(),
        name="coach-program-detail",
    ),
    path(
        "coach/programs/<int:pk>/adherents",
        CoachProgramAdherentsView.as_view(),
        name="coach-program-adherents",
    ),
    # Membre — programmes
    path("programs/coached", CoachedProgramsView.as_view(), name="programs-coached"),
    path("programs/<int:pk>", ProgramDetailView.as_view(), name="program-detail"),
    path(
        "programs/<int:pk>/enroll",
        ProgramEnrollView.as_view(),
        name="program-enroll",
    ),
    # Membre — adhésions
    path("me/enrollments", MyEnrollmentsView.as_view(), name="my-enrollments"),
    path(
        "enrollments/<int:pk>",
        EnrollmentDetailView.as_view(),
        name="enrollment-detail",
    ),
    path(
        "enrollments/<int:pk>/log-session",
        LogSessionView.as_view(),
        name="enrollment-log-session",
    ),
]
