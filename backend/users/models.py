from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings 

class RecycleUser(AbstractUser):
    full_name = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    
    points = models.IntegerField(default=0)
    badge = models.CharField(max_length=50, default='Newcomer')
    
    ROLE_CHOICES = [
        ('resident', 'Resident'),
        ('service_provider', 'Service Provider'),
        ('admin', 'Admin')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='resident')
    email = models.EmailField(unique=True) 

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email

    def update_badge(self):
        if self.points >= 2000: self.badge = "Recycle Legend"
        elif self.points >= 1000: self.badge = "Planet Protector"
        elif self.points >= 500: self.badge = "Waste Warrior"
        elif self.points >= 250: self.badge = "Green Guardian"
        elif self.points >= 100: self.badge = "Eco Starter"
        else: self.badge = "Newcomer"
        self.save()

# --- LOGGING MODEL (UPDATED) ---
class RecyclingLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recycling_logs')
    date = models.DateTimeField(auto_now_add=True)
    points_awarded = models.IntegerField(default=20)
    
    # --- NEW FIELDS FOR REPORTING ---
    WASTE_TYPES = [
        ('Plastic', 'Plastic'),
        ('Glass', 'Glass'),
        ('Paper', 'Paper'),
        ('Metal', 'Metal'),
        ('Electronics', 'Electronics'),
    ]
    waste_type = models.CharField(max_length=50, choices=WASTE_TYPES, default='Plastic')
    quantity = models.CharField(max_length=50, default="1 bag") 
    
    description = models.CharField(max_length=255, default="Standard Recycle Drop-off")

    class Meta:
        db_table = 'recycling_logs'

    def __str__(self):
        return f"{self.user.email} - {self.waste_type} - {self.points_awarded} pts"

# --- LEGACY MODELS ---
class ServiceProvider(models.Model):
    provider_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='user_id')
    company_name = models.CharField(max_length=150)
    service_type = models.CharField(max_length=100, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    license_number = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'service_providers'

class Review(models.Model):
    review_id = models.AutoField(primary_key=True)
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, db_column='provider_id')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='user_id')
    rating = models.IntegerField()
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'

class AdminLog(models.Model):
    log_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_column='user_id')
    action = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admin_logs'

class PickupRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Pickup'),
        ('assigned', 'Assigned to Collector'), # <--- NEW
        ('collected', 'Waste Collected'),
        ('verified', 'Verified & Points Awarded'),
        ('cancelled', 'Cancelled / Rejected'), # <--- UPDATED
    ]

    # Link to the User who is booking
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # We store the Center's Name (Simple approach) or link to a Center model
    center_name = models.CharField(max_length=100) 
    waste_type = models.CharField(max_length=50, choices=RecyclingLog.WASTE_TYPES)
    quantity = models.CharField(max_length=50, default="1 bag")
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    rejection_reason = models.TextField(null=True, blank=True) 

    collector = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_pickups',
        limit_choices_to={'role': 'service_provider'}
    )

    class Meta:
        db_table = 'pickup_requests'

    def __str__(self):
        return f"Request: {self.user.email} - {self.center_name} ({self.status})"