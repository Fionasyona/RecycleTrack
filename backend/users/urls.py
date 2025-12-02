from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecycleUserViewSet, ServiceProviderViewSet

router = DefaultRouter()
router.register(r'accounts', RecycleUserViewSet)       # api/users/accounts/
router.register(r'providers', ServiceProviderViewSet)  # api/users/providers/

urlpatterns = [
    path('', include(router.urls)),
]