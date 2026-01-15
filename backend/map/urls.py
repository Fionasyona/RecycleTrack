from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecyclingCenterViewSet, ReviewViewSet
from . import views

# The Router automatically creates these paths for you:
# GET  /centers/       -> List all centers
# POST /centers/       -> Create a center
# GET  /centers/nearby -> Your custom nearby search
router = DefaultRouter()
router.register(r'centers', RecyclingCenterViewSet, basename='recycling-center')
# router.register(r'reviews', ReviewViewSet, basename='center-reviews') # Optional

urlpatterns = [
    path('', include(router.urls)),
    
    # Custom Views (Keep these if they are still function-based in your views.py)
    path('services/', RecyclingCenterViewSet.as_view({'get': 'services'}), name='available_services'),
    path('activities/', views.get_user_activity_locations, name='user_activities'), # Only if you kept this function
]