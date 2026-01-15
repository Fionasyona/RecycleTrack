# badges/models.py
from django.db import models
from django.conf import settings

class Badge(models.Model):
    badge_id = models.AutoField(primary_key=True)
    badge_name = models.CharField(max_length=100)
    description = models.TextField()
    icon_url = models.CharField(max_length=255, null=True, blank=True)
    
    # Optional: If you want levels for badges (Bronze, Silver, Gold)
    badge_type = models.CharField(max_length=20, default='bronze', choices=[
        ('bronze', 'Bronze'), ('silver', 'Silver'), ('gold', 'Gold')
    ])

    class Meta:
        db_table = 'badges'

    def __str__(self):
        return self.badge_name


class UserBadge(models.Model):
    user_badge_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='user_id')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, db_column='badge_id')
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_badges'
        unique_together = ('user', 'badge') # Prevents earning the same badge twice

    def __str__(self):
        return f"User {self.user_id} - Badge {self.badge.badge_name}"


class PointsHistory(models.Model):
    """Logs history of all points earned for auditing"""
    history_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='user_id')
    points = models.IntegerField()
    activity_type = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'points_history'

    def __str__(self):
        return f"User {self.user_id} - {self.points} points"