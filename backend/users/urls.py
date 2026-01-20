from django.urls import path
from .views import CustomTokenObtainPairView, register_user, get_user_profile, award_points, get_leaderboard

urlpatterns = [
    path('register/', register_user, name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', get_user_profile, name='user-profile'),
    
    # --- NEW ENDPOINT ---
    path('award-points/', award_points, name='award-points'),

    # --- NEW ENDPOINT FOR LEADERBOARD ---
    path('leaderboard/', get_leaderboard, name='leaderboard'),
]