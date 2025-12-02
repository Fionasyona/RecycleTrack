from rest_framework import viewsets
from .models import Reward, RewardRedemption
from .serializers import RewardSerializer, RewardRedemptionSerializer

class RewardViewSet(viewsets.ModelViewSet):
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer

class RewardRedemptionViewSet(viewsets.ModelViewSet):
    queryset = RewardRedemption.objects.all().order_by('-redeemed_at')
    serializer_class = RewardRedemptionSerializer