from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.conf import settings

# --- 1. CUSTOM USER MODEL ---
class RecycleUser(AbstractUser):
    ROLE_CHOICES = [
        ('resident', 'Resident'),
        ('service_provider', 'Service Provider'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='resident')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    points = models.IntegerField(default=0)
    badge = models.CharField(max_length=50, default="Newcomer")
    
    # Default Home Location (Fallback)
    latitude = models.FloatField(default=-1.2921)
    longitude = models.FloatField(default=36.8219)

    groups = models.ManyToManyField(Group, related_name='custom_user_set', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='custom_user_set', blank=True)

    def update_badge(self):
        if self.points >= 2000: self.badge = "Max Level"
        elif self.points >= 1000: self.badge = "Recycle Legend"
        elif self.points >= 500: self.badge = "Planet Protector"
        elif self.points >= 250: self.badge = "Waste Warrior"
        elif self.points >= 100: self.badge = "Green Guardian"
        else: self.badge = "Eco Starter"
        self.save()

# --- 2. RECYCLING CENTER MODEL ---
class RecyclingCenter(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField(blank=True, null=True)
    contact_info = models.CharField(max_length=100, blank=True, null=True)
    accepted_waste_types = models.CharField(max_length=255, default="Plastic, Paper, Glass, Metal")

    def __str__(self):
        return self.name

# --- 3. PICKUP REQUEST MODEL (Updated) ---
class PickupRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('collected', 'Collected'),
        ('verified', 'Verified'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pickup_requests')
    center = models.ForeignKey(RecyclingCenter, on_delete=models.SET_NULL, null=True, blank=True, related_name='requests')
    
    waste_type = models.CharField(max_length=50)
    quantity = models.CharField(max_length=50)
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # --- NEW: Specific Location Fields ---
    pickup_address = models.CharField(max_length=255, help_text="Street or Landmark", blank=True, null=True)
    region = models.CharField(max_length=100, help_text="Estate or Area", blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    assigned_at = models.DateTimeField(blank=True, null=True)
    # ------------------------------------

    collector = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_jobs')
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.waste_type} ({self.status})"

# --- 4. RECYCLING LOG MODEL ---
class RecyclingLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    points_awarded = models.IntegerField()
    waste_type = models.CharField(max_length=50)
    quantity = models.CharField(max_length=50)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)

# --- 5. PAYMENT MODEL ---
class Payment(models.Model):
    PAYMENT_STATUS = [('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    pickup_request = models.ForeignKey(PickupRequest, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_code = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=15)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    date = models.DateTimeField(auto_now_add=True)