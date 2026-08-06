from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import serializers

from accounts.serializers import (
    ProfileSerializer,
    UserSerializer,
)

from .models import (
    Connection,
    Conversation,
    DirectMessage,
    FoodListing,
    Invitation,
    Post,
    PostComment,
    SharedPost,
)

from rest_framework.permissions import (
    BasePermission,
)

class PostCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = PostComment

        fields = (
            "id",
            "author",
            "text",
            "created_at",
        )

        read_only_fields = (
            "id",
            "author",
            "created_at",
        )

    def validate_text(self, value):
        clean_text = value.strip()

        if not clean_text:
            raise serializers.ValidationError(
                "Comment cannot be empty."
            )

        if len(clean_text) > 1000:
            raise serializers.ValidationError(
                "Comment cannot exceed 1,000 characters."
            )

        return clean_text


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    reaction_count = serializers.SerializerMethodField()
    reaction_summary = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()

    comment_count = serializers.SerializerMethodField()

    comments = PostCommentSerializer(
        many=True,
        read_only=True,
    )

    unique_view_count = serializers.SerializerMethodField()
    community_share_count = serializers.SerializerMethodField()
    saved_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Post

        fields = (
            "id",
            "author",
            "post_type",
            "title",
            "text",
            "image",
            "video",
            "location_name",
            "latitude",
            "longitude",
            "reaction_count",
            "reaction_summary",
            "my_reaction",
            "comment_count",
            "comments",
            "unique_view_count",
            "share_count",
            "community_share_count",
            "saved_by_me",
            "created_at",
        )

        read_only_fields = (
            "id",
            "author",
            "reaction_count",
            "reaction_summary",
            "my_reaction",
            "comment_count",
            "comments",
            "unique_view_count",
            "share_count",
            "community_share_count",
            "saved_by_me",
            "created_at",
        )

        extra_kwargs = {
            "post_type": {
                "required": False,
            },
            "title": {
                "required": False,
                "allow_blank": True,
            },
            "text": {
                "required": False,
                "allow_blank": True,
            },
            "image": {
                "required": False,
                "allow_null": True,
            },
            "video": {
                "required": False,
                "allow_null": True,
            },
            "location_name": {
                "required": False,
                "allow_blank": True,
            },
            "latitude": {
                "required": False,
                "allow_null": True,
            },
            "longitude": {
                "required": False,
                "allow_null": True,
            },
        }

    def get_reaction_count(self, obj):
        return obj.reactions.count()

    def get_reaction_summary(self, obj):
        summary = {
            "like": 0,
            "love": 0,
            "haha": 0,
            "wow": 0,
            "sad": 0,
            "angry": 0,
        }

        for reaction in obj.reactions.all():
            reaction_type = reaction.reaction_type

            if reaction_type in summary:
                summary[reaction_type] += 1

        return summary

    def get_my_reaction(self, obj):
        request = self.context.get("request")

        if (
            not request
            or not request.user
            or not request.user.is_authenticated
        ):
            return None

        reaction = obj.reactions.filter(
            user=request.user
        ).first()

        if reaction:
            return reaction.reaction_type

        return None

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_unique_view_count(self, obj):
        return obj.unique_views.count()

    def get_community_share_count(self, obj):
        return obj.community_shares.count()

    def get_saved_by_me(self, obj):
        request = self.context.get("request")

        if (
            not request
            or not request.user
            or not request.user.is_authenticated
        ):
            return False

        return obj.saved_by.filter(
            user=request.user
        ).exists()

    def validate_image(self, uploaded_file):
        if not uploaded_file:
            return uploaded_file

        maximum_size = 5 * 1024 * 1024

        if uploaded_file.size > maximum_size:
            raise serializers.ValidationError(
                "Image must be smaller than 5 MB."
            )

        allowed_content_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
        }

        content_type = getattr(
            uploaded_file,
            "content_type",
            "",
        )

        if content_type not in allowed_content_types:
            raise serializers.ValidationError(
                "Upload a JPG, PNG, or WebP image."
            )

        return uploaded_file

    def validate_video(self, uploaded_file):
        if not uploaded_file:
            return uploaded_file

        maximum_size = 50 * 1024 * 1024

        if uploaded_file.size > maximum_size:
            raise serializers.ValidationError(
                "Video must be smaller than 50 MB."
            )

        allowed_content_types = {
            "video/mp4",
            "video/webm",
            "video/quicktime",
        }

        content_type = getattr(
            uploaded_file,
            "content_type",
            "",
        )

        if content_type not in allowed_content_types:
            raise serializers.ValidationError(
                "Upload an MP4, WebM, or MOV video."
            )

        return uploaded_file

    def validate(self, attrs):
        instance = self.instance

        post_type = attrs.get(
            "post_type",
            getattr(instance, "post_type", "post"),
        )

        title = attrs.get(
            "title",
            getattr(instance, "title", ""),
        )

        text = attrs.get(
            "text",
            getattr(instance, "text", ""),
        )

        image = attrs.get(
            "image",
            getattr(instance, "image", None),
        )

        video = attrs.get(
            "video",
            getattr(instance, "video", None),
        )

        title = title.strip() if title else ""
        text = text.strip() if text else ""

        valid_post_types = {
            "post",
            "article",
            "image",
            "video",
        }

        if post_type not in valid_post_types:
            raise serializers.ValidationError(
                {
                    "post_type": "Invalid post type."
                }
            )

        if post_type == "article" and not title:
            raise serializers.ValidationError(
                {
                    "title": "Article title is required."
                }
            )

        if (
            post_type in ("post", "article")
            and not text
        ):
            raise serializers.ValidationError(
                {
                    "text": "Content is required."
                }
            )

        if post_type == "image" and not image:
            raise serializers.ValidationError(
                {
                    "image": "Please upload an image."
                }
            )

        if post_type == "video" and not video:
            raise serializers.ValidationError(
                {
                    "video": "Please upload a video."
                }
            )

        attrs["title"] = title
        attrs["text"] = text

        return attrs


class FoodListingSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    claimed_by = UserSerializer(read_only=True)

    class Meta:
        model = FoodListing

        fields = (
            "id",
            "owner",
            "title",
            "description",
            "quantity",
            "quantity_kg",
            "location",
            "pickup_time",
            "image",
            "status",
            "claimed_by",
            "created_at",
        )

        read_only_fields = (
            "id",
            "owner",
            "status",
            "claimed_by",
            "created_at",
        )

    def validate_quantity_kg(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Weight must be greater than zero."
            )

        return value


class InvitationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    receiver_email = serializers.EmailField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = Invitation

        fields = (
            "id",
            "sender",
            "receiver",
            "receiver_email",
            "title",
            "note",
            "cuisine",
            "location",
            "scheduled_for",
            "meet_type",
            "status",
            "created_at",
        )

        read_only_fields = (
            "id",
            "sender",
            "receiver",
            "status",
            "created_at",
        )

    def validate_receiver_email(self, value):
        email = value.strip().lower()
        request = self.context.get("request")

        if (
            request
            and request.user.is_authenticated
            and request.user.email.lower() == email
        ):
            raise serializers.ValidationError(
                "You cannot send an invitation to yourself."
            )

        if not User.objects.filter(
            email__iexact=email,
            is_active=True,
        ).exists():
            raise serializers.ValidationError(
                "No active FoodKindl user was found with this email."
            )

        return email

    def create(self, validated_data):
        receiver_email = validated_data.pop(
            "receiver_email"
        )

        try:
            receiver = User.objects.get(
                email__iexact=receiver_email,
                is_active=True,
            )
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {
                    "receiver_email": (
                        "No active FoodKindl user was found "
                        "with this email."
                    )
                }
            )

        return Invitation.objects.create(
            receiver=receiver,
            **validated_data,
        )


class SharedPostSerializer(serializers.ModelSerializer):
    shared_by = UserSerializer(read_only=True)

    class Meta:
        model = SharedPost

        fields = (
            "id",
            "original_post",
            "shared_by",
            "message",
            "created_at",
        )

        read_only_fields = (
            "id",
            "original_post",
            "shared_by",
            "created_at",
        )

    def validate_message(self, value):
        clean_message = value.strip()

        if len(clean_message) > 2000:
            raise serializers.ValidationError(
                "Share message cannot exceed 2,000 characters."
            )

        return clean_message


class MemberSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(
        read_only=True
    )

    full_name = serializers.SerializerMethodField()
    connection_status = serializers.SerializerMethodField()
    connection_id = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = (
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "profile",
            "connection_status",
            "connection_id",
        )

        read_only_fields = fields

    def get_full_name(self, obj):
        full_name = obj.get_full_name().strip()

        return full_name or obj.email

    def get_connection(self, obj):
        request = self.context.get("request")

        if (
            not request
            or not request.user
            or not request.user.is_authenticated
        ):
            return None

        return (
            Connection.objects
            .filter(
                Q(
                    sender=request.user,
                    receiver=obj,
                )
                | Q(
                    sender=obj,
                    receiver=request.user,
                )
            )
            .order_by("-created_at")
            .first()
        )

    def get_connection_status(self, obj):
        connection = self.get_connection(obj)

        if not connection:
            return "none"

        request = self.context.get("request")

        if connection.status == "accepted":
            return "connected"

        if connection.status == "pending":
            if (
                request
                and connection.sender_id
                == request.user.id
            ):
                return "request_sent"

            return "request_received"

        return connection.status

    def get_connection_id(self, obj):
        connection = self.get_connection(obj)

        if connection:
            return connection.id

        return None


class ConnectionSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    receiver_id = serializers.IntegerField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = Connection

        fields = (
            "id",
            "sender",
            "receiver",
            "receiver_id",
            "status",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "sender",
            "receiver",
            "status",
            "created_at",
            "updated_at",
        )

    def validate_receiver_id(self, value):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if request.user.id == value:
            raise serializers.ValidationError(
                "You cannot connect with yourself."
            )

        if not User.objects.filter(
            id=value,
            is_active=True,
        ).exists():
            raise serializers.ValidationError(
                "This FoodKindl member was not found."
            )

        return value

    def validate(self, attrs):
        request = self.context.get("request")
        receiver_id = attrs.get("receiver_id")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                {
                    "detail": "Authentication is required."
                }
            )

        existing_connection = (
            Connection.objects
            .filter(
                Q(
                    sender=request.user,
                    receiver_id=receiver_id,
                )
                | Q(
                    sender_id=receiver_id,
                    receiver=request.user,
                )
            )
            .order_by("-created_at")
            .first()
        )

        if existing_connection:
            if existing_connection.status == "accepted":
                raise serializers.ValidationError(
                    {
                        "detail": (
                            "You are already connected "
                            "with this member."
                        )
                    }
                )

            if (
                existing_connection.status == "pending"
                and existing_connection.sender_id
                == receiver_id
            ):
                raise serializers.ValidationError(
                    {
                        "detail": (
                            "This member has already sent "
                            "you a connection request."
                        )
                    }
                )

            if (
                existing_connection.status == "pending"
                and existing_connection.sender_id
                == request.user.id
            ):
                raise serializers.ValidationError(
                    {
                        "detail": (
                            "You have already sent a "
                            "connection request to this member."
                        )
                    }
                )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]

        receiver_id = validated_data.pop(
            "receiver_id"
        )

        receiver = User.objects.get(
            id=receiver_id,
            is_active=True,
        )

        existing_connection = (
            Connection.objects
            .filter(
                sender=request.user,
                receiver=receiver,
            )
            .first()
        )

        if existing_connection:
            existing_connection.status = "pending"

            existing_connection.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            return existing_connection

        return Connection.objects.create(
            sender=request.user,
            receiver=receiver,
            status="pending",
        )

class DirectMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(
        read_only=True
    )

    class Meta:
        model = DirectMessage

        fields = (
            "id",
            "conversation",
            "sender",
            "text",
            "is_read",
            "created_at",
        )

        read_only_fields = (
            "id",
            "conversation",
            "sender",
            "is_read",
            "created_at",
        )

    def validate_text(self, value):
        clean_text = value.strip()

        if not clean_text:
            raise serializers.ValidationError(
                "Message cannot be empty."
            )

        if len(clean_text) > 3000:
            raise serializers.ValidationError(
                "Message cannot exceed 3,000 characters."
            )

        return clean_text


class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(
        many=True,
        read_only=True,
    )

    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    food_listing_id = serializers.IntegerField(
        source="food_listing.id",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Conversation
        fields = (
            "id",
            "conversation_type",
            "title",
            "food_listing_id",
            "participants",
            "other_user",
            "last_message",
            "unread_count",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_other_user(self, obj):
        request = self.context.get("request")

        if obj.conversation_type != "direct":
            return None

        if (
            not request
            or not request.user
            or not request.user.is_authenticated
        ):
            return None

        other_user = (
            obj.participants
            .exclude(id=request.user.id)
            .select_related("profile")
            .first()
        )

        if not other_user:
            return None

        return UserSerializer(
            other_user,
            context={"request": request},
        ).data

    def get_last_message(self, obj):
        message = (
            obj.messages
            .select_related(
                "sender",
                "sender__profile",
            )
            .order_by("-created_at")
            .first()
        )

        if not message:
            return None

        return DirectMessageSerializer(
            message,
            context=self.context,
        ).data

    def get_unread_count(self, obj):
        request = self.context.get("request")

        if (
            not request
            or not request.user
            or not request.user.is_authenticated
        ):
            return 0

        return (
            obj.messages
            .filter(is_read=False)
            .exclude(sender=request.user)
            .count()
        )


class IsVerifiedMember(BasePermission):
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