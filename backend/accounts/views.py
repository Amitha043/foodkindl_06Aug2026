from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    EmailLoginSerializer,
    ProfileSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            UserSerializer(
                user,
                context={"request": request},
            ).data,
            status=status.HTTP_201_CREATED,
        )


class EmailLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailLoginSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(
            request.user,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class ProfileUpdateView(
    generics.RetrieveUpdateAPIView
):
    serializer_class = ProfileSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_object(self):
        return self.request.user.profile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop(
            "partial",
            False,
        )

        profile = self.get_object()

        serializer = self.get_serializer(
            profile,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            UserSerializer(
                request.user,
                context={
                    "request": request,
                },
            ).data,
            status=status.HTTP_200_OK,
        )


class VerificationStatusView(APIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(self, request):
        profile = request.user.profile

        return Response(
            {
                "government_id_uploaded": bool(
                    profile.government_id
                ),
                "government_id_type": (
                    profile.government_id_type
                ),
                "verification_status": (
                    profile.verification_status
                ),
                "is_verified": (
                    profile.is_verified
                ),
                "rejection_reason": (
                    profile.rejection_reason
                ),
                "verified_at": (
                    profile.verified_at
                ),
            },
            status=status.HTTP_200_OK,
        )