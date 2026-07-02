"""Application Celery pour le projet GymAI (préparé pour les sprints suivants)."""
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("gymai")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
