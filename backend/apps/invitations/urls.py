"""URLs de l'app invitations (montées sous /api/v1/)."""
from django.urls import path

from .views import (
    CoachInvitationsView,
    InvitationAcceptView,
    InvitationCreateView,
    InvitationResolveView,
)

urlpatterns = [
    # Coach
    path("invitations", InvitationCreateView.as_view(), name="invitation-create"),
    path(
        "coach/invitations",
        CoachInvitationsView.as_view(),
        name="coach-invitations",
    ),
    # Membre / résolution par token
    path(
        "invitations/<uuid:token>",
        InvitationResolveView.as_view(),
        name="invitation-resolve",
    ),
    path(
        "invitations/<uuid:token>/accept",
        InvitationAcceptView.as_view(),
        name="invitation-accept",
    ),
]
