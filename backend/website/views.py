from rest_framework import generics, permissions
from .models import ContactMessage, WaitlistEntry
from .serializers import ContactMessageSerializer, WaitlistEntrySerializer

class WaitlistCreateView(generics.CreateAPIView):
    queryset = WaitlistEntry.objects.all()
    serializer_class = WaitlistEntrySerializer
    permission_classes = [permissions.AllowAny]

class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]
