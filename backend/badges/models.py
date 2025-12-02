from django.db import models

class Badge(models.Model):

    badge_id = models.AutoField(primary_key=True)
    badge_name = models.CharField(max_length=100)
    description = models.TextField()
    icon_url = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        
        managed = False 
        db_table = 'badges'

    def __str__(self):
        return self.badge_name


class UserBadge(models.Model):
    user_badge_id = models.AutoField(primary_key=True)
    
    
    user = models.ForeignKey('users.RecycleUser', on_delete=models.CASCADE, db_column='user_id')
    

    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, db_column='badge_id')
    
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'user_badges'

    def __str__(self):
        return f"User {self.user_id} - Badge {self.badge.badge_name}"


class PointsHistory(models.Model):
    history_id = models.AutoField(primary_key=True)
    
    user = models.ForeignKey('users.RecycleUser', on_delete=models.CASCADE, db_column='user_id')
    
    points = models.IntegerField()
    activity_type = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'points_history'

    def __str__(self):
        return f"User {self.user_id} - {self.points} points"