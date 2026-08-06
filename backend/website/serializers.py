from rest_framework import serializers
from .models import ContactMessage, WaitlistEntry

class WaitlistEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WaitlistEntry
        fields = ("id", "full_name", "email", "city", "created_at")
        read_only_fields = ("id", "created_at")

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "subject", "message", "created_at")
        read_only_fields = ("id", "created_at")
