from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings               # <-- Import this
from django.conf.urls.static import static

# --- IMPORT THESE TWO LINES ---
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def home(request):
    return HttpResponse("<h1>RecycleTrack API is Running!</h1>")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),

    # --- ADD THESE TWO PATHS ---
    # This allows the frontend to refresh the token instead of kicking you out
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # ---------------------------
    
    # Connect the Users App
    path('api/users/', include('users.urls')),
    
    # Connect the Badges App
    path('api/badges/', include('badges.urls')),

    # Connect the Waste App
    path('api/waste/', include('waste.urls')),

    # Connect the Notifications App
    path('api/notifications/', include('notifications.urls')),

    # Connect the Rewards App
    path('api/rewards/', include('rewards.urls')),

    # Connect the Maps App
    path('api/map/', include('map.urls')),

    # Connect the Education App
    path('api/education/', include('education.urls')),  

    # Connect the Recycling App
    path('api/recycling/', include('recycling.urls')),

    # Connect the Centers App
    path('api/centers/', include('centers.urls')),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)