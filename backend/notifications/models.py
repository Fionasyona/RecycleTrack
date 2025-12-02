from django.db import models
from users.models import RecycleUser 


class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)  # Added
    user = models.ForeignKey(RecycleUser, on_delete=models.CASCADE, db_column='user_id')
    message = models.TextField()  # SQL doesn't have 'title' field
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'notifications'

    def __str__(self):
        return f"Notification for {self.user.full_name}"

