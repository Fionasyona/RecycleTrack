from rest_framework import serializers
from .models import Badge, UserBadge, PointsHistory


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UserBadgeSerializer(serializers.ModelSerializer):

    badge_details = BadgeSerializer(source='badge', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    class Meta:
        model = UserBadge
        fields = ['user_badge_id', 'user', 'user_name', 'badge', 'badge_details', 'awarded_at']


class PointsHistorySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    class Meta:
        model = PointsHistory
        fields = ['history_id', 'user', 'user_name', 'points', 'activity_type', 'created_at']
