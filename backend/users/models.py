from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
import uuid

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
    
    # --- POINTS SYSTEM REFIT ---
    # Spendable points (decreases when they redeem cash)
    redeemable_points = models.IntegerField(default=0) 
    # Historical total (NEVER decreases, used for Badges/Leaderboards)
    lifetime_points = models.IntegerField(default=0)   
    
    badge = models.CharField(max_length=50, default="Eco Starter")
    
    latitude = models.FloatField(default=-1.2921)
    longitude = models.FloatField(default=36.8219)

    groups = models.ManyToManyField(Group, related_name='custom_user_set', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='custom_user_set', blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def update_badge(self):
        # Badge is now based on LIFETIME points, so spending points doesn't lose rank
        if self.lifetime_points >= 2000: self.badge = "Max Level"
        elif self.lifetime_points >= 1000: self.badge = "Recycle Legend"
        elif self.lifetime_points >= 500: self.badge = "Planet Protector"
        elif self.lifetime_points >= 250: self.badge = "Waste Warrior"
        elif self.lifetime_points >= 100: self.badge = "Green Guardian"
        else: self.badge = "Eco Starter"
        self.save()

# --- 2. WALLET & FINANCIAL MODELS (NEW) ---
class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) # Actual KES
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email}'s Wallet: KES {self.balance}"

class WalletTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('redemption', 'Points Redemption'), # Points -> Cash
        ('withdrawal', 'M-Pesa Withdrawal'), # Cash -> M-Pesa
        ('deposit', 'Deposit'),              # Rare, but good to have
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reference_code = models.CharField(max_length=50, unique=True, default=uuid.uuid4) # For M-Pesa receipts or internal tracking
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.transaction_type} - KES {self.amount} - {self.status}"

# --- NEW: WITHDRAWAL REQUEST MODEL ---
class WithdrawalRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paid', 'Paid'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='withdrawals')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    mpesa_number = models.CharField(max_length=15)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    admin_note = models.TextField(blank=True, null=True) # Reason for rejection

    def __str__(self):
        return f"{self.user.email} - {self.amount} ({self.status})"

# --- 3. DRIVER PROFILE ---
class DriverProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver_profile')
    id_no = models.CharField(max_length=20, unique=True, blank=True, null=True) # Made nullable to prevent migration errors
    license_no = models.CharField(max_length=20, unique=True, blank=True, null=True) # Made nullable
    is_verified = models.BooleanField(default=False)
    total_earned = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Driver: {self.user.email} - {'Verified' if self.is_verified else 'Pending'}"

# --- 4. RECYCLING CENTER MODEL ---
class RecyclingCenter(models.Model):
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    address = models.TextField(blank=True, null=True)
    contact_info = models.CharField(max_length=100, blank=True, null=True)
    accepted_waste_types = models.CharField(max_length=255, default="Plastic, Paper, Glass, Metal")

    def __str__(self):
        return self.name

# --- 5. PICKUP REQUEST MODEL ---
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
    quantity = models.CharField(max_length=50) # Initial estimate
    scheduled_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Billing / Verification
    actual_quantity = models.FloatField(default=0.0) # Verified weight
    billed_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00) 
    is_paid = models.BooleanField(default=False) 

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

# --- 6. RECYCLING LOG ---
class RecyclingLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    points_awarded = models.IntegerField()
    waste_type = models.CharField(max_length=50)
    quantity = models.CharField(max_length=50)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)

# --- 7. NOTIFICATION MODEL ---
class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    pickup = models.ForeignKey(PickupRequest, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Notification for {self.user.email}"

# --- 8. SIGNALS ---

# Auto-create Wallet and DriverProfile when User is created
@receiver(post_save, sender=RecycleUser)
def create_user_related_models(sender, instance, created, **kwargs):
    if created:
        # Everyone gets a wallet
        Wallet.objects.create(user=instance)
        
        # Only service providers get a driver profile
        if instance.role == 'service_provider':
            DriverProfile.objects.create(
                user=instance,
                # Use unique temporary values to prevent unique constraint errors
                id_no=f"TEMP-{instance.id}-{uuid.uuid4().hex[:6]}", 
                license_no=f"TEMP-{instance.id}-{uuid.uuid4().hex[:6]}",
                total_earned=0.00
            )

@receiver(post_save, sender=RecycleUser)
def save_user_related_models(sender, instance, **kwargs):
    # Safe check to ensure wallet exists (for old users during migration)
    if not hasattr(instance, 'wallet'):
         Wallet.objects.create(user=instance)
    else:
        instance.wallet.save()

    if instance.role == 'service_provider' and hasattr(instance, 'driver_profile'):
        instance.driver_profile.save()