from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CenterViewSet

router = DefaultRouter()
router.register(r'locations', CenterViewSet)

urlpatterns = [
    path('', include(router.urls)),
]