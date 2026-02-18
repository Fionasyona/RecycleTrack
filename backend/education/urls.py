from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet, VideoViewSet, CategoryViewSet

router = DefaultRouter()
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'videos', VideoViewSet, basename='video')
router.register(r'categories', CategoryViewSet, basename='category') # <--- Added this line

urlpatterns = [
    path('', include(router.urls)),
]