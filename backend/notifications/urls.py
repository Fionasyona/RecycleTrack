from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

router = DefaultRouter()
router.register(r'list', NotificationViewSet)  # api/notifications/list/

urlpatterns = [
    path('', include(router.urls)),
]