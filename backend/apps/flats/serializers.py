"""
Flat serializers.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Flat, FlatMembership, InviteToken, MemberMonthStatus
from apps.accounts.serializers import UserSerializer

User = get_user_model()


class FlatSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.full_name", read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Flat
        fields = [
            "id", "name", "address", "owner", "owner_name",
            "member_count", "is_active", "created_at",
        ]
        read_only_fields = ["id", "owner", "created_at"]

    def get_member_count(self, obj):
        return obj.memberships.filter(is_active=True).count()


class FlatMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FlatMembership
        fields = ["id", "user", "flat", "role", "is_active", "created_at"]
        read_only_fields = ["id", "user", "flat", "created_at"]


class InviteTokenSerializer(serializers.ModelSerializer):
    invite_url = serializers.SerializerMethodField()
    is_valid = serializers.BooleanField(read_only=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = InviteToken
        fields = [
            "id", "flat", "token", "expires_at", "max_uses",
            "times_used", "is_active", "is_valid", "invite_url", "created_at",
        ]
        read_only_fields = [
            "id", "flat", "token", "times_used", "created_at", "invite_url",
        ]

    def get_invite_url(self, obj):
        request = self.context.get("request")
        frontend = "http://localhost:3000"
        if request:
            origin = request.headers.get("Origin", frontend)
            frontend = origin
        return f"{frontend}/join/{obj.token}"


class JoinFlatSerializer(serializers.Serializer):
    """Validate invite token and join the flat."""

    token = serializers.CharField()

    def validate_token(self, value):
        try:
            invite = InviteToken.objects.select_related("flat").get(token=value)
        except InviteToken.DoesNotExist:
            raise serializers.ValidationError("Invalid invite token.")
        if not invite.is_valid:
            raise serializers.ValidationError("Invite link expired or fully used.")
        self._invite = invite
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        invite = self._invite

        membership, created = FlatMembership.objects.get_or_create(
            user=user,
            flat=invite.flat,
            defaults={"role": FlatMembership.Role.MEMBER, "is_active": True},
        )
        if not created and not membership.is_active:
            membership.is_active = True
            membership.save(update_fields=["is_active"])

        invite.times_used += 1
        if invite.times_used >= invite.max_uses:
            invite.is_active = False
        invite.save(update_fields=["times_used", "is_active"])

        return membership


class MemberMonthStatusSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="membership.user.full_name", read_only=True)
    user_id = serializers.CharField(source="membership.user.id", read_only=True)

    class Meta:
        model = MemberMonthStatus
        fields = [
            "id", "membership", "flat", "year", "month",
            "is_active", "active_from", "active_until", "note",
            "user_name", "user_id", "created_at",
        ]
        read_only_fields = ["id", "flat", "created_at", "user_name", "user_id"]
