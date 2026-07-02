"""Configuration de l'app subscriptions."""
from django.apps import AppConfig


class SubscriptionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.subscriptions"
    label = "subscriptions"
    verbose_name = "Abonnements"
