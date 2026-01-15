from django.urls import path
from .views import CustomTokenObtainPairView, register_user, get_user_profile

urlpatterns = [
    # --- FIX IS HERE ---
    # Changed 'auth/register/' to 'register/' to match your frontend call
    path('register/', register_user, name='register'),
    
    # Login can stay as 'auth/login/' if your frontend calls that correctly
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('profile/', get_user_profile, name='user-profile'),
]