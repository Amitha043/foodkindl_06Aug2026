from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    government_id_uploaded = serializers.SerializerMethodField()

    class Meta:
        model = Profile

        fields = (
            "bio",
            "city",
            "locality",
            "postcode",
            "college_workplace",
            "role",
            "interests",
            "dietary_preference",
            "profile_image_1",
            "profile_image_2",
            "profile_image_3",
            "government_id",
            "government_id_uploaded",
            "government_id_type",
            "verification_status",
            "is_verified",
            "verified_at",
            "rejection_reason",
            "women_only_mode",
        )

        read_only_fields = (
            "government_id_uploaded",
            "verification_status",
            "is_verified",
            "verified_at",
            "rejection_reason",
        )

        extra_kwargs = {
            "government_id": {
                "write_only": True,
                "required": False,
                "allow_null": True,
            },
            "government_id_type": {
                "required": False,
                "allow_blank": True,
            },
        }

    def get_government_id_uploaded(self, obj):
        return bool(obj.government_id)

    def validate_profile_image_1(self, uploaded_file):
        return self.validate_profile_image(uploaded_file)

    def validate_profile_image_2(self, uploaded_file):
        return self.validate_profile_image(uploaded_file)

    def validate_profile_image_3(self, uploaded_file):
        return self.validate_profile_image(uploaded_file)

    def validate_profile_image(self, uploaded_file):
        if not uploaded_file:
            return uploaded_file

        maximum_size = 5 * 1024 * 1024

        if uploaded_file.size > maximum_size:
            raise serializers.ValidationError(
                "Profile image must be smaller than 5 MB."
            )

        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
        }

        content_type = getattr(
            uploaded_file,
            "content_type",
            "",
        )

        if content_type not in allowed_types:
            raise serializers.ValidationError(
                "Upload a JPG, PNG, or WebP image."
            )

        return uploaded_file

    def validate_government_id(self, uploaded_file):
        if not uploaded_file:
            return uploaded_file

        maximum_size = 5 * 1024 * 1024

        if uploaded_file.size > maximum_size:
            raise serializers.ValidationError(
                "Government ID must be smaller than 5 MB."
            )

        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
        }

        content_type = getattr(
            uploaded_file,
            "content_type",
            "",
        )

        if content_type not in allowed_types:
            raise serializers.ValidationError(
                "Upload a JPG, PNG, WebP, or PDF document."
            )

        return uploaded_file

    def validate(self, attrs):
        government_id = attrs.get("government_id")
        government_id_type = attrs.get(
            "government_id_type"
        )

        if government_id and not government_id_type:
            raise serializers.ValidationError({
                "government_id_type": (
                    "Select the type of Government ID."
                )
            })

        return attrs

    def update(self, instance, validated_data):
        government_id = validated_data.get(
            "government_id"
        )

        if government_id:
            instance.verification_status = "pending"
            instance.is_verified = False
            instance.verified_by = None
            instance.verified_at = None
            instance.rejection_reason = ""

        return super().update(
            instance,
            validated_data,
        )


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "profile",
        )

    def get_full_name(self, obj):
        return (
            obj.get_full_name().strip()
            or obj.email
        )


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        trim_whitespace=False,
    )

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "password",
        )

        read_only_fields = (
            "id",
        )

    def validate_email(self, value):
        email = value.strip().lower()

        if not email:
            raise serializers.ValidationError(
                "Email is required."
            )

        if User.objects.filter(
            email__iexact=email
        ).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return email

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data["email"].strip().lower()

        user = User(
            username=email,
            email=email,
            first_name=validated_data.get(
                "first_name",
                "",
            ).strip(),
            last_name=validated_data.get(
                "last_name",
                "",
            ).strip(),
        )

        user.set_password(password)
        user.save()

        return user


class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        write_only=True
    )

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        password = attrs["password"]

        try:
            database_user = User.objects.get(
                email__iexact=email
            )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {
                    "detail": "Invalid email or password."
                }
            )

        user = authenticate(
            request=self.context.get("request"),
            username=database_user.username,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError(
                {
                    "detail": "Invalid email or password."
                }
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {
                    "detail": "This account is disabled."
                }
            )

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(
                user,
                context=self.context,
            ).data,
        }