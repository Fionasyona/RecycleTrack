from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver

# --- 1. CUSTOM USER MODEL ---
class RecycleUser(AbstractUser):
    ROLE_CHOICES = [
        ('resident', 'Resident'),
        ('service_provider', 'Service Provider'),
        ('admin', 'Admin'),
    ]
    
    email = models.EmailField(unique=True) 
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='resident')
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    points = models.IntegerField(default=0)
    badge = models.CharField(max_length=50, default="Newcomer")
    
    latitude = models.FloatField(default=-1.2921)
    longitude = models.FloatField(default=36.8219)

    groups = models.ManyToManyField(Group, related_name='custom_user_set', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='custom_user_set', blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def update_badge(self):
        if self.points >= 2000: self.badge = "Max Level"
        elif self.points >= 1000: self.badge = "Recycle Legend"
        elif self.points >= 500: self.badge = "Planet Protector"
        elif self.points >= 250: self.badge = "Waste Warrior"
        elif self.points >= 100: self.badge = "Green Guardian"
        else: self.badge = "Eco Starter"
        self.save()

# --- 2. DRIVER PROFILE ---
class DriverProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_profile')
    id_no = models.CharField(max_length=20, unique=True)
    license_no = models.CharField(max_length=20, unique=True)
    is_verified = models.BooleanField(default=False)
    total_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Driver: {self.user.email} - {'Verified' if self.is_verified else 'Pending'}"

# --- 3. RECYCLING CENTER MODEL ---
class RecyclingCenter(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField(blank=True, null=True)
    contact_info = models.CharField(max_length=100, blank=True, null=True)
    accepted_waste_types = models.CharField(max_length=255, default="Plastic, Paper, Glass, Metal")

    def __str__(self):
        return self.name

# --- 4. PICKUP REQUEST MODEL ---
class PickupRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('collected', 'Collected'),
        ('verified', 'Verified'),
        ('paid', 'Paid'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pickup_requests')
    center = models.ForeignKey(RecyclingCenter, on_delete=models.SET_NULL, null=True, blank=True, related_name='requests')
    collector = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_jobs')
    
    waste_type = models.CharField(max_length=50)
    quantity = models.CharField(max_length=50) # Initial estimate by user
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # --- NEW FIELDS FOR BILLING ---
    actual_quantity = models.FloatField(default=0.0) # Verified weight by driver
    billed_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Calculated cost
    is_paid = models.BooleanField(default=False) # Payment status
    # ------------------------------

    pickup_address = models.CharField(max_length=255, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    assigned_at = models.DateTimeField(blank=True, null=True)
    
    rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    was_on_time = models.BooleanField(default=True)
    review_text = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.status}"

# --- 5. RECYCLING LOG ---
class RecyclingLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    points_awarded = models.IntegerField()
    waste_type = models.CharField(max_length=50)
    quantity = models.CharField(max_length=50)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)

# --- 6. PAYMENT MODEL ---
class Payment(models.Model):
    PAYMENT_STATUS = [('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    pickup_request = models.ForeignKey(PickupRequest, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_code = models.CharField(max_length=50, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    date = models.DateTimeField(auto_now_add=True)

# --- 7. NOTIFICATION MODEL ---
class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    pickup = models.ForeignKey(PickupRequest, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Notification for {self.user.email} - {self.message[:20]}"

# --- 8. SIGNALS ---
@receiver(post_save, sender=RecycleUser)
def create_driver_profile(sender, instance, created, **kwargs):
    if created and instance.role == 'service_provider':
        DriverProfile.objects.get_or_create(
            user=instance,
            defaults={
                'id_no': f"TEMP-{instance.id}", 
                'license_no': f"TEMP-{instance.id}",
                'total_earned': 0.00
            }
        )

@receiver(post_save, sender=RecycleUser)
def save_driver_profile(sender, instance, **kwargs):
    if instance.role == 'service_provider' and hasattr(instance, 'driver_profile'):
        instance.driver_profile.save()