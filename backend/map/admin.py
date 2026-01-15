# backend/map/admin.py
from django.contrib import admin
from .models import RecyclingCenter, CenterService, UserActivityLocation, CenterReview


@admin.register(RecyclingCenter)
class RecyclingCenterAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'address', 'phone', 'rating', 'is_active']
    list_filter = ['type', 'is_active']
    search_fields = ['name', 'address']


@admin.register(CenterService)
class CenterServiceAdmin(admin.ModelAdmin):
    list_display = ['center', 'service_name']
    list_filter = ['service_name']


@admin.register(UserActivityLocation)
class UserActivityLocationAdmin(admin.ModelAdmin):
    list_display = ['user', 'activity_type', 'points_earned', 'created_at']
    list_filter = ['activity_type']
    search_fields = ['user__full_name']


@admin.register(CenterReview)
class CenterReviewAdmin(admin.ModelAdmin):
    list_display = ['center', 'user', 'rating', 'created_at']
    list_filter = ['rating']