"""Permissions pour les endpoints programmes coachés & invitations."""
from rest_framework.permissions import BasePermission, SAFE_METHODS

COACH_ROLES = {"coach", "manager"}


class IsCoachOrManager(BasePermission):
    """Autorise uniquement les rôles coach ou manager (accès aux routes /coach/*)."""

    message = "Réservé aux coachs et gérants."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and user.role in COACH_ROLES
        )


class IsProgramOwnerCoach(IsCoachOrManager):
    """Coach/manager ET propriétaire du programme (owner_coach == user)."""

    message = "Vous n'êtes pas le propriétaire de ce programme."

    def has_object_permission(self, request, view, obj):
        # obj est un Program.
        return obj.owner_coach_id == request.user.id


class IsEnrollmentOwner(BasePermission):
    """Le membre propriétaire de l'adhésion, ou le coach du programme."""

    message = "Vous n'avez pas accès à cette adhésion."

    def has_object_permission(self, request, view, obj):
        # obj est un ProgramEnrollment.
        user = request.user
        if obj.member_id == user.id:
            return True
        if request.method in SAFE_METHODS and obj.coach_id == user.id:
            return True
        return False
