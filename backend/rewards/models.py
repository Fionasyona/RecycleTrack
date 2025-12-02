from django.db import models
from users.models import RecycleUser


class Reward(models.Model):
    reward_id = models.AutoField(primary_key=True)  # Added
    reward_name = models.CharField(max_length=150)  # Was 'title'
    points_required = models.IntegerField()  # Was 'cost_points'
    description = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'rewards'

    def __str__(self):
        return self.reward_name


class RewardRedemption(models.Model):
    redemption_id = models.AutoField(primary_key=True)  # Added
    user = models.ForeignKey(RecycleUser, on_delete=models.CASCADE, db_column='user_id')
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
        managed = False
        db_table = 'reward_redemptions'

    def __str__(self):
        return f"{self.user.full_name} redeemed {self.reward.reward_name}"
