from django.contrib import admin
from .models import UserPoints, Activity, Leaderboard, Achievement

@admin.register(UserPoints)
class UserPointsAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_points', 'current_level', 'rank')
    search_fields = ('user__full_name', 'user__email')

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'points_earned', 'created_at')
    list_filter = ('activity_type', 'is_verified')

@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ('user', 'rank', 'period_type', 'points')
    list_filter = ('period_type',)

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'points_awarded', 'achieved_at')