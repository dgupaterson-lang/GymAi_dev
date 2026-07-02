"""Sérialiseurs de l'app accounts."""
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import HEX_COLOR_VALIDATOR, Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    """Préférences du membre. Permet de changer accent_color et theme_mode."""

    accent_color = serializers.CharField(
        max_length=7, validators=[HEX_COLOR_VALIDATOR], required=False
    )

    class Meta:
        model = Profile
        fields = [
            "objective",
            "level",
            "weekly_freq",
            "theme_mode",
            "accent_color",
            "voice_cues",
            "birthdate",
            "height_cm",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class UserSerializer(serializers.ModelSerializer):
    """Représentation de l'utilisateur courant (avec son profil imbriqué)."""

    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "full_name",
            "role",
            "avatar",
            "is_verified",
            "is_active",
            "date_joined",
            "profile",
        ]
        read_only_fields = [
            "id",
            "email",
            "role",
            "is_verified",
            "is_active",
            "date_joined",
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """Création d'un compte (membre par défaut)."""

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ["id", "email", "password", "full_name", "phone"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login : ajoute quelques infos utiles dans le token."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data
