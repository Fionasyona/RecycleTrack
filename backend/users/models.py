from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings 

class RecycleUser(AbstractUser):
    # Custom fields
    full_name = models.CharField(max_length=100)
    # Added separate name fields for better compatibility
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    
    # --- GAMIFICATION FIELDS ---
    points = models.IntegerField(default=0)
    
    # CHANGED: Badge is now a real database field, not just a property
    badge = models.CharField(max_length=50, default='Newcomer')
    
    # Role Field
    ROLE_CHOICES = [
        ('resident', 'Resident'),
        ('service_provider', 'Service Provider'),
        ('admin', 'Admin')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='resident')

    # Fix conflicts with default Django User model
    email = models.EmailField(unique=True) 

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email

    # --- NEW: AUTOMATED BADGE LOGIC ---
    def update_badge(self):
        """
        Updates the badge based on current points.
        Call this whenever points are modified.
        """
        if self.points >= 2000:
            self.badge = "Recycle Legend"
        elif self.points >= 1000:
            self.badge = "Planet Protector"
        elif self.points >= 500:
            self.badge = "Waste Warrior"
        elif self.points >= 250:
            self.badge = "Green Guardian"
        elif self.points >= 100:
            self.badge = "Eco Starter"
        else:
            self.badge = "Newcomer"
        
        self.save() # Saves the new badge to the database

# --- LOGGING MODEL ---
class RecyclingLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recycling_logs')
    date = models.DateTimeField(auto_now_add=True)
    points_awarded = models.IntegerField(default=20)
    description = models.CharField(max_length=255, default="Standard Recycle Drop-off")

    class Meta:
        db_table = 'recycling_logs'

    def __str__(self):
        return f"{self.user.email} - {self.points_awarded} pts - {self.date.strftime('%Y-%m-%d')}"

# --- LEGACY MODELS (Kept for compatibility) ---
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