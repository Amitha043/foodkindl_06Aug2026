from django.urls import path

from .views import (
    EmailLoginView,
    MeView,
    ProfileUpdateView,
    RegisterView,
    VerificationStatusView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailLoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("profile/", ProfileUpdateView.as_view(), name="profile"),
    path(
        "verification-status/",
        VerificationStatusView.as_view(),
        name="verification-status",
    ),
]