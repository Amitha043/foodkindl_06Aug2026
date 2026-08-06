from django.urls import path
from .views import ContactCreateView, WaitlistCreateView

urlpatterns = [
    path("waitlist/", WaitlistCreateView.as_view()),
    path("contact/", ContactCreateView.as_view()),
]
