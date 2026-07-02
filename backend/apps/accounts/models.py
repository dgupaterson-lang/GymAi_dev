"""Modèles de l'app accounts : User (custom) et Profile (1:1)."""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
    RegexValidator,
)
from django.db import models
from django.utils import timezone

from .managers import UserManager

# Validateur de couleur hexadécimale (#abc ou #aabbcc)
HEX_COLOR_VALIDATOR = RegexValidator(
    regex=r"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$",
    message="La couleur doit être un code hexadécimal valide (ex. #5fe3f0).",
)


class User(AbstractBaseUser, PermissionsMixin):
    """Utilisateur GymAI. L'email sert d'identifiant de connexion."""

    class Role(models.TextChoices):
        MEMBER = "member", "Membre"
        COACH = "coach", "Coach"
        MANAGER = "manager", "Gérant"
        ADMIN = "admin", "Admin"

    email = models.EmailField("adresse e-mail", unique=True)
    phone = models.CharField(
        "téléphone", max_length=20, unique=True, null=True, blank=True
    )
    full_name = models.CharField("nom complet", max_length=150, blank=True)
    role = models.CharField(
        "rôle", max_length=10, choices=Role.choices, default=Role.MEMBER
    )
    avatar = models.ImageField(
        "avatar", upload_to="avatars/", null=True, blank=True
    )
    is_verified = models.BooleanField("vérifié", default=False)

    is_active = models.BooleanField("actif", default=True)
    is_staff = models.BooleanField("équipe", default=False)
    date_joined = models.DateTimeField("inscrit le", default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # email + password demandés par défaut

    class Meta:
        verbose_name = "utilisateur"
        verbose_name_plural = "utilisateurs"
        ordering = ["-date_joined"]

    def __str__(self):
        return self.email

    @property
    def is_member(self):
        return self.role == self.Role.MEMBER


class Profile(models.Model):
    """Préférences et données du membre (1:1 avec User)."""

    class ThemeMode(models.TextChoices):
        DARK = "dark", "Dark"
        ROSE = "rose", "Rose"

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile"
    )

    # Onboarding (champs libres ce sprint ; les choix seront contraints plus tard)
    objective = models.CharField("objectif", max_length=50, blank=True)
    level = models.CharField("niveau", max_length=30, blank=True)
    weekly_freq = models.PositiveSmallIntegerField(
        "fréquence hebdo",
        default=3,
        validators=[MinValueValidator(2), MaxValueValidator(6)],
    )

    # Préférences d'apparence
    theme_mode = models.CharField(
        "thème",
        max_length=10,
        choices=ThemeMode.choices,
        default=ThemeMode.DARK,
    )
    accent_color = models.CharField(
        "couleur d'accent",
        max_length=7,
        default="#5fe3f0",
        validators=[HEX_COLOR_VALIDATOR],
    )
    voice_cues = models.BooleanField("indications vocales", default=True)

    # Données corporelles
    birthdate = models.DateField("date de naissance", null=True, blank=True)
    height_cm = models.PositiveSmallIntegerField(
        "taille (cm)", null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "profil"
        verbose_name_plural = "profils"

    def __str__(self):
        return f"Profil de {self.user.email}"
