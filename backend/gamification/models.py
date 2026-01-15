# gamification/models.py
from django.db import models
from django.utils import timezone
from django.conf import settings

class UserPoints(models.Model):
    """Track user points and levels"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='points')
    total_points = models.IntegerField(default=0)
    current_level = models.IntegerField(default=1)
    rank = models.IntegerField(default=0)
    weekly_points = models.IntegerField(default=0)
    monthly_points = models.IntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)
    streak_days = models.IntegerField(default=0)
    last_streak_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_points'
        ordering = ['-total_points']
        verbose_name = 'User Points'
        verbose_name_plural = 'User Points'

    def __str__(self):
        return f"{self.user} - {self.total_points} points"

    def add_points(self, points, activity_type="general"):
        self.total_points += points
        self.weekly_points += points
        self.monthly_points += points
        self.current_level = (self.total_points // 1000) + 1
        self.update_streak()
        self.save()
        return self.total_points

    def update_streak(self):
        today = timezone.now().date()
        if self.last_streak_date:
            days_diff = (today - self.last_streak_date).days
            if days_diff == 1:
                self.streak_days += 1
            elif days_diff > 1:
                self.streak_days = 1
        else:
            self.streak_days = 1
        self.last_streak_date = today


class Activity(models.Model):
    """User recycling activities"""
    ACTIVITY_TYPES = [
        ('recycle', 'Recycling'),
        ('proper_disposal', 'Proper Disposal'),
        ('report_issue', 'Report Issue'),
        ('education', 'Education Complete'),
    ]

    WASTE_CATEGORIES = [
        ('plastic', 'Plastic'),
        ('paper', 'Paper/Cardboard'),
        ('glass', 'Glass'),
        ('metal', 'Metal'),
        ('electronics', 'Electronics'),
        ('organic', 'Organic'),
        ('hazardous', 'Hazardous'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    category = models.CharField(max_length=50, choices=WASTE_CATEGORIES, null=True, blank=True)
    quantity = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    points_earned = models.IntegerField(default=0)
    image = models.TextField(null=True, blank=True)
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activities'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.activity_type} - {self.points_earned}pts"


class Leaderboard(models.Model):
    """Leaderboard snapshots"""
    PERIOD_TYPES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('all_time', 'All Time'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leaderboard_entries')
    period_type = models.CharField(max_length=20, choices=PERIOD_TYPES)
    rank = models.IntegerField()
    points = models.IntegerField()
    period_start = models.DateField()
    period_end = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'leaderboard'
        unique_together = ('user', 'period_type', 'period_start')
        ordering = ['period_type', 'rank']

    def __str__(self):
        return f"{self.user} - Rank {self.rank} ({self.period_type})"


class Achievement(models.Model):
    """Special achievements and milestones"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='🎉')
    points_awarded = models.IntegerField(default=0)
    achieved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'achievements'
        ordering = ['-achieved_at']

    def __str__(self):
        return f"{self.user} - {self.title}"