"""URLs de l'app accounts (montées sous /api/v1/)."""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    LogoutView,
    MeProfileView,
    MeView,
    RegisterView,
)

urlpatterns = [
    # Auth
    path("auth/register", RegisterView.as_view(), name="auth-register"),
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/refresh", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/logout", LogoutView.as_view(), name="auth-logout"),
    # Compte courant
    path("me", MeView.as_view(), name="me"),
    path("me/profile", MeProfileView.as_view(), name="me-profile"),
]
