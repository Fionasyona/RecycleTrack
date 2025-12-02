from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RewardViewSet, RewardRedemptionViewSet

router = DefaultRouter()
router.register(r'catalog', RewardViewSet)          # api/rewards/catalog/
router.register(r'redemptions', RewardRedemptionViewSet) # api/rewards/redemptions/

urlpatterns = [
    path('', include(router.urls)),
]