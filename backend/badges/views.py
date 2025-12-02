from rest_framework import viewsets
from .models import Badge, UserBadge, PointsHistory
from .serializers import BadgeSerializer, UserBadgeSerializer, PointsHistorySerializer

class BadgeViewSet(viewsets.ModelViewSet):
    
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer

class UserBadgeViewSet(viewsets.ModelViewSet):
    
    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer

class PointsHistoryViewSet(viewsets.ModelViewSet):

    queryset = PointsHistory.objects.all().order_by('-created_at')
    serializer_class = PointsHistorySerializer