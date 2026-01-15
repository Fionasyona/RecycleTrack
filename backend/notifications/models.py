# notifications/models.py
from django.db import models
from django.conf import settings # <--- FIXED

class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    
    # <--- FIXED
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='user_id')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # managed = False
        db_table = 'notifications'

    def __str__(self):
        return f"Notification for {self.user}"