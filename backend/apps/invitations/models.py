"""Modèle Invitation : invitation à un programme coaché ou un groupe (RG-56..60)."""
import uuid
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

# Durée de validité par défaut d'une invitation (RG-57/RG-60).
DEFAULT_EXPIRY_DAYS = 14


def default_expires_at():
    return timezone.now() + timedelta(days=DEFAULT_EXPIRY_DAYS)


class Invitation(models.Model):
    """Invitation à rejoindre un programme coaché ou un groupe.

    Cible un membre existant (notif in-app) ou un contact externe
    (téléphone/e-mail/lien/QR incitant au téléchargement).
    """

    class Kind(models.TextChoices):
        PROGRAM = "program", "Programme"
        GROUP = "group", "Groupe"

    class TargetType(models.TextChoices):
        MEMBER = "member", "Membre existant"
        CONTACT = "contact", "Contact externe"

    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        ACCEPTED = "accepted", "Acceptée"
        EXPIRED = "expired", "Expirée"

    from_coach = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_invitations",
    )
    kind = models.CharField(
        "type", max_length=10, choices=Kind.choices, default=Kind.PROGRAM
    )
    program = models.ForeignKey(
        "programs.Program",
        on_delete=models.CASCADE,
        related_name="invitations",
        null=True,
        blank=True,
    )
    # NB : le modèle groups.Group n'existe pas encore (app stub). On stocke
    # une référence "souple" (id) pour supporter kind=group sans coupler l'app
    # groups ; la FK réelle sera ajoutée quand le modèle Group existera.
    group_id = models.PositiveIntegerField(
        "groupe (id)", null=True, blank=True
    )
    target_type = models.CharField(
        "type de cible",
        max_length=10,
        choices=TargetType.choices,
        default=TargetType.MEMBER,
    )
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_invitations",
        null=True,
        blank=True,
    )
    contact = models.CharField(
        "contact externe", max_length=150, null=True, blank=True
    )
    token = models.UUIDField("token", default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(
        "statut", max_length=10, choices=Status.choices, default=Status.PENDING
    )
    expires_at = models.DateTimeField("expire le", default=default_expires_at)
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="accepted_invitations",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "invitation"
        verbose_name_plural = "invitations"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invitation {self.kind} {self.token}"

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    @property
    def deep_link(self):
        return f"gymai://invite/{self.token}"

    def refresh_status(self):
        """Marque l'invitation comme expirée si nécessaire (sans forcer la sauvegarde)."""
        if self.status == self.Status.PENDING and self.is_expired:
            self.status = self.Status.EXPIRED
        return self.status
