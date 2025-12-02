from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WasteCategoryViewSet, DisposalReportViewSet

router = DefaultRouter()
router.register(r'categories', WasteCategoryViewSet)  # api/waste/categories/
router.register(r'reports', DisposalReportViewSet)    # api/waste/reports/

urlpatterns = [
    path('', include(router.urls)),
]