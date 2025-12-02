from rest_framework import serializers
from .models import Reward, RewardRedemption


class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = '__all__'


class RewardRedemptionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    reward_name = serializers.CharField(source='reward.reward_name', read_only=True)
    class Meta:
        model = RewardRedemption
        fields = '__all__'

