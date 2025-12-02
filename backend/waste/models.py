from django.db import models
from users.models import RecycleUser, ServiceProvider


class WasteCategory(models.Model):
    category_id = models.AutoField(primary_key=True)  # Added
    category_name = models.CharField(max_length=100)  # Was 'name'
    description = models.TextField(null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'waste_categories'

    def __str__(self):
        return self.category_name


class DisposalReport(models.Model):
    report_id = models.AutoField(primary_key=True)  # Added
    user = models.ForeignKey(RecycleUser, on_delete=models.CASCADE, db_column='user_id')
    provider = models.ForeignKey(ServiceProvider, on_delete=models.SET_NULL, null=True, blank=True, db_column='provider_id')  # Changed name
    category = models.ForeignKey(WasteCategory, on_delete=models.CASCADE, db_column='category_id')
    image_url = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(  # Added
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('verified', 'Verified'),
            ('rejected', 'Rejected')
        ],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'disposal_reports'

    def __str__(self):
        return f"Report by {self.user.full_name} - {self.status}"
