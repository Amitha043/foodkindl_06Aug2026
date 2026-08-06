from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS,
)


class IsOwnerOrReadOnly(BasePermission):
    """
    Allow everyone with access to read an object.

    Only the object's owner may update or delete it.
    Supports objects that use author, owner, or sender.
    """

    message = (
        "You do not have permission to modify this item."
    )

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        if request.method in SAFE_METHODS:
            return True

        object_owner = (
            getattr(obj, "author", None)
            or getattr(obj, "owner", None)
            or getattr(obj, "sender", None)
        )

        return object_owner == request.user


class IsVerifiedMember(BasePermission):
    """
    Allow access only when the authenticated user's
    Government ID has been approved.
    """

    message = (
        "Your Government ID must be approved "
        "before you can access this feature."
    )

    def has_permission(
        self,
        request,
        view,
    ):
        if not request.user.is_authenticated:
            return False

        profile = getattr(
            request.user,
            "profile",
            None,
        )

        return bool(
            profile
            and profile.is_verified
            and profile.verification_status
            == "approved"
        )