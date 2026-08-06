from django.contrib import admin
from .models import ContactMessage, WaitlistEntry

@admin.register(WaitlistEntry)
class WaitlistAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "city", "created_at")
    search_fields = ("full_name", "email", "city")

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "created_at", "is_resolved")
    list_filter = ("is_resolved",)
    search_fields = ("name", "email", "subject")
