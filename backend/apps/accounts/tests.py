"""Tests de base pour l'app accounts."""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APITestCase

User = get_user_model()


class UserModelTest(TestCase):
    def test_create_user_creates_profile(self):
        user = User.objects.create_user(
            email="test@email.com", password="x", full_name="Test"
        )
        self.assertEqual(user.role, "member")
        self.assertTrue(hasattr(user, "profile"))
        self.assertEqual(user.profile.accent_color, "#5fe3f0")
        self.assertEqual(user.profile.theme_mode, "dark")

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email="admin@email.com", password="x"
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertEqual(admin.role, "admin")


class AuthFlowTest(APITestCase):
    def test_register_login_me_patch_profile(self):
        # Register
        r = self.client.post(
            "/api/v1/auth/register",
            {"email": "david@email.com", "password": "Sup3rPass!42", "full_name": "David"},
            format="json",
        )
        self.assertEqual(r.status_code, 201)

        # Login
        r = self.client.post(
            "/api/v1/auth/login",
            {"email": "david@email.com", "password": "Sup3rPass!42"},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertIn("access", r.data)
        self.assertEqual(r.data["user"]["role"], "member")
        access = r.data["access"]
        refresh = r.data["refresh"]

        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + access)

        # GET /me
        r = self.client.get("/api/v1/me")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["profile"]["accent_color"], "#5fe3f0")

        # PATCH profile : accent_color + theme_mode
        r = self.client.patch(
            "/api/v1/me/profile",
            {"accent_color": "#ff6699", "theme_mode": "rose"},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["accent_color"], "#ff6699")
        self.assertEqual(r.data["theme_mode"], "rose")

        # PATCH profile : couleur invalide -> 400
        r = self.client.patch(
            "/api/v1/me/profile", {"accent_color": "red"}, format="json"
        )
        self.assertEqual(r.status_code, 400)

        # Refresh
        r = self.client.post(
            "/api/v1/auth/refresh", {"refresh": refresh}, format="json"
        )
        self.assertEqual(r.status_code, 200)
        new_refresh = r.data.get("refresh", refresh)

        # Logout (blacklist)
        r = self.client.post(
            "/api/v1/auth/logout", {"refresh": new_refresh}, format="json"
        )
        self.assertEqual(r.status_code, 205)
