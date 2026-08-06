from django.contrib import admin
from django.utils import timezone

from .models import Profile


@admin.action(
    description="Approve selected identity documents"
)
def approve_identity_documents(
    modeladmin,
    request,
    queryset,
):
    queryset.update(
        verification_status="approved",
        is_verified=True,
        verified_by=request.user,
        verified_at=timezone.now(),
        rejection_reason="",
    )


@admin.action(
    description="Reject selected identity documents"
)
def reject_identity_documents(
    modeladmin,
    request,
    queryset,
):
    queryset.update(
        verification_status="rejected",
        is_verified=False,
        verified_by=request.user,
        verified_at=None,
        rejection_reason=(
            "The submitted document could not "
            "be verified. Please upload a clear document."
        ),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "government_id_type",
        "government_id_uploaded",
        "verification_status",
        "is_verified",
        "verified_by",
        "verified_at",
    )

    list_filter = (
        "verification_status",
        "is_verified",
        "government_id_type",
    )

    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
    )

    readonly_fields = (
        "verified_by",
        "verified_at",
    )

    actions = (
        approve_identity_documents,
        reject_identity_documents,
    )

    def government_id_uploaded(
        self,
        obj,
    ):
        return bool(obj.government_id)

    government_id_uploaded.boolean = True

    def save_model(
        self,
        request,
        obj,
        form,
        change,
    ):
        if obj.verification_status == "approved":
            obj.is_verified = True
            obj.verified_by = request.user

            if not obj.verified_at:
                obj.verified_at = timezone.now()

            obj.rejection_reason = ""

        elif obj.verification_status == "rejected":
            obj.is_verified = False
            obj.verified_by = request.user
            obj.verified_at = None

        else:
            obj.is_verified = False

        super().save_model(
            request,
            obj,
            form,
            change,
        )