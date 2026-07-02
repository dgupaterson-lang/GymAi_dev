"""Admin de l'app gyms."""
from django.contrib import admin

from .models import Gym


@admin.register(Gym)
class GymAdmin(admin.ModelAdmin):
    list_display = ["name", "city", "rating", "is_active"]
    list_filter = ["is_active", "city"]
    search_fields = ["name", "city", "address"]
