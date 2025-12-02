from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BadgeViewSet, UserBadgeViewSet, PointsHistoryViewSet

router = DefaultRouter()
router.register(r'definitions', BadgeViewSet)      # api/badges/definitions/
router.register(r'awarded', UserBadgeViewSet)      # api/badges/awarded/
router.register(r'history', PointsHistoryViewSet)  # api/badges/history/

urlpatterns = [
    path('', include(router.urls)),
]