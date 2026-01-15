from django.contrib import admin
from .models import Badge, UserBadge, PointsHistory

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('badge_name', 'description')
    search_fields = ('badge_name',)

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('user', 'badge', 'awarded_at')
    search_fields = ('user__full_name', 'badge__badge_name')

@admin.register(PointsHistory)
class PointsHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'points', 'activity_type', 'created_at')
    list_filter = ('activity_type',)