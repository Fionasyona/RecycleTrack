# badges/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BadgeViewSet, 
    UserBadgeViewSet, 
    PointsHistoryViewSet, 
    get_user_badges, 
    claim_badge
)

router = DefaultRouter()
router.register(r'list', BadgeViewSet)
router.register(r'user-badges', UserBadgeViewSet)
router.register(r'history', PointsHistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('my-badges/', get_user_badges, name='get_user_badges'),
    path('claim/<int:badge_id>/', claim_badge, name='claim_badge'),
]