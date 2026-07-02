"""Tests d'intégration : programmes coachés, invitations, adhésions & suivi."""
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalog.models import Exercise
from apps.invitations.models import Invitation
from apps.programs.models import Program, ProgramEnrollment

User = get_user_model()


class ProgramsFlowTests(APITestCase):
    """Parcours complet coach → invitation → adhésion → suivi."""

    def setUp(self):
        self.coach = User.objects.create_user(
            email="coach@test.com", password="pass1234", role="coach", full_name="Coach"
        )
        self.david = User.objects.create_user(
            email="david@test.com", password="pass1234", role="member",
            full_name="David Mensah",
        )
        self.ex1 = Exercise.objects.create(
            name="Développé couché", muscle="Pectoraux",
            default_sets=4, default_reps=10, default_rest_s=90, charge_hint="60 kg",
        )
        self.ex2 = Exercise.objects.create(
            name="Dips lestés", muscle="Triceps",
            default_sets=3, default_reps=8, default_rest_s=90, charge_hint="+10 kg",
        )

    # ------------------------------------------------------------------
    def _create_program(self):
        """Le coach crée un programme coaché à 2 jours (→ target = 2 * ceil(30/7) = 8)."""
        self.client.force_authenticate(self.coach)
        payload = {
            "title": "Défi 30 jours — Prise de masse",
            "description": "Programme coaché suivi sur 1 mois.",
            "duration_days": 30,
            "objective": "Prendre du muscle",
            "level": "Intermédiaire",
            "days": [
                {
                    "title": "Pectoraux & Triceps", "weekday": 1, "order": 0,
                    "exercises": [
                        {"exercise_id": self.ex1.id, "sets": 4, "reps": 10,
                         "charge": "60 kg", "rest_s": 90, "order": 0},
                    ],
                },
                {
                    "title": "Triceps", "weekday": 3, "order": 1,
                    "exercises": [
                        {"exercise_id": self.ex2.id, "sets": 3, "reps": 8,
                         "charge": "+10 kg", "rest_s": 90, "order": 0},
                    ],
                },
            ],
        }
        resp = self.client.post(reverse("coach-programs"), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        return resp.data

    def test_coach_creates_program(self):
        data = self._create_program()
        self.assertEqual(data["kind"], "coach_shared")
        self.assertTrue(data["is_shared"])
        self.assertEqual(len(data["days"]), 2)
        self.assertEqual(data["days"][0]["exercises"][0]["exercise"]["name"],
                         "Développé couché")

    def test_non_coach_gets_403_on_coach_programs(self):
        self.client.force_authenticate(self.david)
        resp = self.client.get(reverse("coach-programs"))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        resp = self.client.post(reverse("coach-programs"), {"title": "x"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_invitation_and_accept_creates_enrollment(self):
        program = self._create_program()
        program_id = program["id"]

        # Le coach crée une invitation pour David.
        self.client.force_authenticate(self.coach)
        resp = self.client.post(reverse("invitation-create"), {
            "kind": "program", "program_id": program_id,
            "target_type": "member", "member_id": self.david.id,
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        token = resp.data["token"]
        self.assertTrue(resp.data["url"].startswith("gymai://invite/"))
        self.assertEqual(resp.data["status"], "pending")

        # David résout puis accepte l'invitation → auto-enroll.
        self.client.force_authenticate(self.david)
        resolve = self.client.get(reverse("invitation-resolve", args=[token]))
        self.assertEqual(resolve.status_code, status.HTTP_200_OK)
        self.assertEqual(resolve.data["program"]["id"], program_id)

        accept = self.client.post(reverse("invitation-accept", args=[token]))
        self.assertEqual(accept.status_code, status.HTTP_201_CREATED, accept.data)
        enrollment_id = accept.data["id"]

        # sessions_target = 2 jours × ceil(30/7)=5 = 10.
        self.assertEqual(accept.data["sessions_target"], 10)
        self.assertEqual(accept.data["sessions_done"], 0)
        self.assertEqual(accept.data["status"], "active")

        # L'invitation est passée à accepted.
        inv = Invitation.objects.get(token=token)
        self.assertEqual(inv.status, Invitation.Status.ACCEPTED)
        self.assertEqual(inv.accepted_by_id, self.david.id)

        # Un ProgramEnrollment existe bien.
        self.assertTrue(
            ProgramEnrollment.objects.filter(
                member=self.david, program_id=program_id
            ).exists()
        )
        return program_id, enrollment_id

    def test_log_session_increments_and_is_bounded(self):
        program_id, enrollment_id = self.test_invitation_and_accept_creates_enrollment()
        self.client.force_authenticate(self.david)
        url = reverse("enrollment-log-session", args=[enrollment_id])

        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["sessions_done"], 1)

        # Borné à sessions_target (10) : on ne dépasse pas.
        for _ in range(20):
            self.client.post(url)
        enrollment = ProgramEnrollment.objects.get(pk=enrollment_id)
        self.assertEqual(enrollment.sessions_done, enrollment.sessions_target)
        self.assertEqual(enrollment.sessions_done, 10)
        self.assertEqual(enrollment.status, ProgramEnrollment.Status.COMPLETED)

    def test_adherents_lists_member_with_adherence(self):
        program_id, enrollment_id = self.test_invitation_and_accept_creates_enrollment()

        # David logue 5 séances → adherence 50 %.
        self.client.force_authenticate(self.david)
        url = reverse("enrollment-log-session", args=[enrollment_id])
        for _ in range(5):
            self.client.post(url)

        # Le coach consulte les adhérents.
        self.client.force_authenticate(self.coach)
        resp = self.client.get(reverse("coach-program-adherents", args=[program_id]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data["results"] if isinstance(resp.data, dict) else resp.data
        self.assertEqual(len(results), 1)
        row = results[0]
        self.assertEqual(row["member"]["full_name"], "David Mensah")
        self.assertEqual(row["sessions_done"], 5)
        self.assertEqual(row["sessions_target"], 10)
        self.assertEqual(row["adherence_pct"], 50)

    def test_member_only_sees_own_enrollments(self):
        program_id, enrollment_id = self.test_invitation_and_accept_creates_enrollment()

        # Un autre membre ne doit pas voir l'adhésion de David.
        other = User.objects.create_user(
            email="other@test.com", password="pass1234", role="member",
        )
        self.client.force_authenticate(other)
        resp = self.client.get(reverse("my-enrollments"))
        results = resp.data["results"] if isinstance(resp.data, dict) else resp.data
        self.assertEqual(len(results), 0)

        detail = self.client.get(reverse("enrollment-detail", args=[enrollment_id]))
        self.assertEqual(detail.status_code, status.HTTP_403_FORBIDDEN)

    def test_coach_cannot_invite_on_foreign_program(self):
        program = self._create_program()
        other_coach = User.objects.create_user(
            email="coach2@test.com", password="pass1234", role="coach",
        )
        self.client.force_authenticate(other_coach)
        resp = self.client.post(reverse("invitation-create"), {
            "kind": "program", "program_id": program["id"],
            "target_type": "member", "member_id": self.david.id,
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
