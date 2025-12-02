from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("<h1>RecycleTrack API is Running!</h1>")

urlpatterns = [

    path('', home),
    path('admin/', admin.site.urls),
    
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

]