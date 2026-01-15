# waste/models.py
from django.db import models
from django.conf import settings # <--- FIXED
# You can keep ServiceProvider import if it's in a separate app, or use string reference 'users.ServiceProvider'
from users.models import ServiceProvider 

class WasteCategory(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)

    class Meta:
        # managed = False
        db_table = 'waste_categories'

    def __str__(self):
        return self.category_name


class DisposalReport(models.Model):
    report_id = models.AutoField(primary_key=True)
    
    # <--- FIXED
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='user_id')
    
    # If ServiceProvider is in 'users' app, this import is usually fine, 
    # but string reference is safer: 'users.ServiceProvider'
    provider = models.ForeignKey(ServiceProvider, on_delete=models.SET_NULL, null=True, blank=True, db_column='provider_id')
    
    category = models.ForeignKey(WasteCategory, on_delete=models.CASCADE, db_column='category_id')
    image_url = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(
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
        # managed = False
        db_table = 'disposal_reports'

    def __str__(self):
        return f"Report by {self.user} - {self.status}"