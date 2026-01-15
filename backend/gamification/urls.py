# gamification/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'activities', views.ActivityViewSet, basename='activity')
# REMOVED: BadgeViewSet (It is now in badges/urls.py)

urlpatterns = [
    path('', include(router.urls)),
    
    # Custom endpoints
    path('stats/', views.get_user_stats, name='user-stats'),
    path('points/', views.get_user_points, name='user-points'),
    path('leaderboard/', views.get_leaderboard, name='leaderboard'),
    path('report-activity/', views.report_activity, name='report-activity'),
    path('my-activities/', views.get_user_activities, name='user-activities'),
    path('achievements/', views.get_achievements, name='user-achievements'),
    
    # REMOVED: get_user_badges, claim_badge (They are now in badges/urls.py)
]