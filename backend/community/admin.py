from django.contrib import admin

from .models import (
    FoodListing,
    Invitation,
    Post,
    PostComment,
    PostReaction,
    PostView,
    SavedPost,
    SharedPost,
)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "author",
        "post_type",
        "title",
        "location_name",
        "created_at",
    )

    list_filter = (
        "post_type",
        "created_at",
    )

    search_fields = (
        "title",
        "text",
        "author__email",
        "location_name",
    )

    readonly_fields = (
        "created_at",
    )


@admin.register(PostReaction)
class PostReactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "post",
        "user",
        "reaction_type",
        "created_at",
    )

    list_filter = (
        "reaction_type",
        "created_at",
    )

    search_fields = (
        "user__email",
        "post__title",
        "post__text",
    )


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "post",
        "author",
        "short_text",
        "created_at",
    )

    search_fields = (
        "text",
        "author__email",
        "post__title",
    )

    def short_text(self, obj):
        return obj.text[:50]

    short_text.short_description = "Comment"


@admin.register(SavedPost)
class SavedPostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "post",
        "user",
        "created_at",
    )

    search_fields = (
        "user__email",
        "post__title",
    )


@admin.register(PostView)
class PostViewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "post",
        "user",
        "session_key",
        "created_at",
    )

    search_fields = (
        "user__email",
        "session_key",
        "post__title",
    )


@admin.register(SharedPost)
class SharedPostAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "original_post",
        "shared_by",
        "short_message",
        "created_at",
    )

    search_fields = (
        "shared_by__email",
        "message",
        "original_post__title",
    )

    def short_message(self, obj):
        return obj.message[:50]

    short_message.short_description = "Message"


@admin.register(FoodListing)
class FoodListingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "owner",
        "quantity_kg",
        "location",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "owner__email",
        "location",
    )


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "sender",
        "receiver",
        "meet_type",
        "status",
        "scheduled_for",
    )

    list_filter = (
        "meet_type",
        "status",
        "scheduled_for",
    )

    search_fields = (
        "title",
        "sender__email",
        "receiver__email",
        "location",
    )