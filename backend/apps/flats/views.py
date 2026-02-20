"""
Flat views – CRUD, invite, join, member month status.
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Flat, FlatMembership, InviteToken, MemberMonthStatus
from .serializers import (
    FlatSerializer,
    FlatMembershipSerializer,
    InviteTokenSerializer,
    JoinFlatSerializer,
    MemberMonthStatusSerializer,
)
from apps.permissions.guards import IsOwner, HasFlatPermission
from apps.core.models import ActivityLog


class FlatDetailView(generics.RetrieveUpdateAPIView):
    """Get or update the current flat."""

    serializer_class = FlatSerializer

    def get_object(self):
        return self.request.flat


class FlatMemberListView(generics.ListAPIView):
    """List all active members of current flat."""

    serializer_class = FlatMembershipSerializer

    def get_queryset(self):
        return FlatMembership.objects.filter(
            flat=self.request.flat, is_active=True
        ).select_related("user")


class CreateInviteView(generics.CreateAPIView):
    """Owner creates an invite link."""

    serializer_class = InviteTokenSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def perform_create(self, serializer):
        invite = serializer.save(
            flat=self.request.flat,
            created_by=self.request.user,
        )
        ActivityLog.log(
            user=self.request.user,
            flat=self.request.flat,
            action=ActivityLog.ActionType.MEMBER_INVITE,
            description="Created invite link",
            metadata={"invite_id": str(invite.id)},
            request=self.request,
        )


class ListInvitesView(generics.ListAPIView):
    """Owner lists all invites for current flat."""

    serializer_class = InviteTokenSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return InviteToken.objects.filter(flat=self.request.flat).order_by("-created_at")


class JoinFlatView(APIView):
    """Authenticated user joins a flat via invite token."""

    def post(self, request):
        serializer = JoinFlatSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        membership = serializer.save()
        ActivityLog.log(
            user=request.user,
            flat=membership.flat,
            action=ActivityLog.ActionType.MEMBER_JOIN,
            description=f"{request.user.full_name} joined the flat",
            metadata={"membership_id": str(membership.id)},
            request=request,
        )
        return Response(
            {
                "success": True,
                "flat": FlatSerializer(membership.flat).data,
                "message": "Joined flat successfully.",
            },
            status=status.HTTP_200_OK,
        )


class RemoveMemberView(APIView):
    """Owner removes a member."""

    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request, membership_id):
        try:
            membership = FlatMembership.objects.get(
                id=membership_id, flat=request.flat
            )
        except FlatMembership.DoesNotExist:
            return Response(
                {"success": False, "errors": {"detail": "Member not found"}},
                status=status.HTTP_404_NOT_FOUND,
            )
        if membership.is_owner:
            return Response(
                {"success": False, "errors": {"detail": "Cannot remove owner"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        membership.is_active = False
        membership.save(update_fields=["is_active"])
        ActivityLog.log(
            user=request.user,
            flat=request.flat,
            action=ActivityLog.ActionType.MEMBER_REMOVE,
            description=f"Removed member {membership.user.full_name}",
            metadata={"membership_id": str(membership.id), "removed_user_id": str(membership.user.id)},
            request=request,
        )
        return Response({"success": True, "message": "Member removed."})


class MyFlatsView(generics.ListAPIView):
    """List flats the authenticated user belongs to."""

    serializer_class = FlatMembershipSerializer

    def get_queryset(self):
        return FlatMembership.objects.filter(
            user=self.request.user, is_active=True
        ).select_related("flat", "user")


class MemberMonthStatusListView(APIView):
    """List/manage member month statuses for a given month."""

    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get(self, request):
        year = int(request.query_params.get("year", 0))
        month = int(request.query_params.get("month", 0))
        if not year or not month:
            return Response(
                {"success": False, "errors": {"detail": "year and month are required"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        statuses = MemberMonthStatus.objects.filter(
            flat=request.flat, year=year, month=month
        ).select_related("membership__user")

        serializer = MemberMonthStatusSerializer(statuses, many=True)
        return Response({"success": True, "statuses": serializer.data})


class MemberMonthStatusUpdateView(APIView):
    """Create or update a member's month status (onboard/offboard)."""

    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def post(self, request):
        membership_id = request.data.get("membership")
        year = request.data.get("year")
        month = request.data.get("month")

        if not all([membership_id, year, month]):
            return Response(
                {"success": False, "errors": {"detail": "membership, year, and month are required"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            membership = FlatMembership.objects.get(id=membership_id, flat=request.flat)
        except FlatMembership.DoesNotExist:
            return Response(
                {"success": False, "errors": {"detail": "Member not found"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        obj, created = MemberMonthStatus.objects.update_or_create(
            membership=membership,
            flat=request.flat,
            year=year,
            month=month,
            defaults={
                "is_active": request.data.get("is_active", True),
                "active_from": request.data.get("active_from"),
                "active_until": request.data.get("active_until"),
                "note": request.data.get("note", ""),
            },
        )

        ActivityLog.log(
            user=request.user,
            flat=request.flat,
            action=ActivityLog.ActionType.MEMBER_STATUS,
            description=f"{'Created' if created else 'Updated'} month status for {membership.user.full_name} ({year}-{month:02d})",
            metadata={"membership_id": str(membership.id), "year": year, "month": month, "is_active": request.data.get("is_active", True)},
            request=request,
        )

        serializer = MemberMonthStatusSerializer(obj)
        return Response({"success": True, "status": serializer.data})
