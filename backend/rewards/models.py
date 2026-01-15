# rewards/models.py
from django.db import models
from django.conf import settings # <--- FIXED

class Reward(models.Model):
    reward_id = models.AutoField(primary_key=True)
    reward_name = models.CharField(max_length=150)
    points_required = models.IntegerField()
    description = models.TextField(null=True, blank=True)

    class Meta:
        # managed = False
        db_table = 'rewards'

    def __str__(self):
        return self.reward_name


class RewardRedemption(models.Model):
    redemption_id = models.AutoField(primary_key=True)
    
    # <--- FIXED
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='user_id')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE, db_column='reward_id')
    redeemed_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )

    class Meta:
        # managed = False
        db_table = 'reward_redemptions'

    def __str__(self):
        return f"{self.user} redeemed {self.reward.reward_name}"