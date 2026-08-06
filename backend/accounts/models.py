from django.contrib.auth.models import User
from django.db import models

from django.contrib.auth.models import User
from django.db import models


class Profile(models.Model):
    DIET_CHOICES = [
        ("none", "No preference"),
        ("vegetarian", "Vegetarian"),
        ("vegan", "Vegan"),
        ("halal", "Halal"),
        ("keto", "Keto"),
        ("pescatarian", "Pescatarian"),
        ("gluten_free", "Gluten-free"),
    ]

    VERIFICATION_STATUS_CHOICES = [
        ("not_submitted", "Not submitted"),
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    GOVERNMENT_ID_TYPE_CHOICES = [
        ("aadhaar", "Aadhaar Card"),
        ("passport", "Passport"),
        ("driving_licence", "Driving Licence"),
        ("voter_id", "Voter ID"),
        ("pan", "PAN Card"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    bio = models.TextField(blank=True)

    city = models.CharField(
        max_length=120,
        blank=True,
    )

    locality = models.CharField(
        max_length=120,
        blank=True,
    )

    postcode = models.CharField(
        max_length=12,
        blank=True,
    )

    college_workplace = models.CharField(
        max_length=180,
        blank=True,
    )

    role = models.CharField(
        max_length=120,
        blank=True,
    )

    interests = models.CharField(
        max_length=255,
        blank=True,
    )

    dietary_preference = models.CharField(
        max_length=30,
        choices=DIET_CHOICES,
        default="none",
    )

    profile_image_1 = models.ImageField(
        upload_to="profiles/photos/",
        blank=True,
        null=True,
    )

    profile_image_2 = models.ImageField(
        upload_to="profiles/photos/",
        blank=True,
        null=True,
    )

    profile_image_3 = models.ImageField(
        upload_to="profiles/photos/",
        blank=True,
        null=True,
    )

    government_id = models.FileField(
        upload_to="private/government_ids/",
        blank=True,
        null=True,
    )

    government_id_type = models.CharField(
        max_length=30,
        choices=GOVERNMENT_ID_TYPE_CHOICES,
        blank=True,
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default="not_submitted",
        db_index=True,
    )

    is_verified = models.BooleanField(
        default=False,
        db_index=True,
    )

    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_foodkindl_profiles",
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    rejection_reason = models.TextField(
        blank=True,
    )

    women_only_mode = models.BooleanField(
        default=False,
    )

    def __str__(self):
        return self.user.email