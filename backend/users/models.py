# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

# NOTE: If you are using a custom user model, you should inherit from AbstractUser
# If RecycleUser is your main user, it's best to define it like this:

class RecycleUser(AbstractUser):
    # We disable the default 'username' field and use email instead if you prefer,
    # or we keep username but make email unique. Let's keep it simple:
    
    # Custom fields
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    
    # Role Field
    ROLE_CHOICES = [
        ('resident', 'Resident'),
        ('service_provider', 'Service Provider'),
        ('admin', 'Admin')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='resident')

    # Fix conflicts with default Django User model
    email = models.EmailField(unique=True) # Enforce unique email

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username  # AbstractUser uses username by default


class ServiceProvider(models.Model):
    provider_id = models.AutoField(primary_key=True)
    # Use string reference to avoid circular imports within the same app if needed
    user = models.ForeignKey('RecycleUser', on_delete=models.CASCADE, db_column='user_id')
    company_name = models.CharField(max_length=150)
    service_type = models.CharField(max_length=100, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    license_number = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        # managed = False <-- REMOVE THIS
        db_table = 'service_providers'

    def __str__(self):
        return self.company_name


class Review(models.Model):
    review_id = models.AutoField(primary_key=True)
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, db_column='provider_id')
    user = models.ForeignKey('RecycleUser', on_delete=models.CASCADE, db_column='user_id')
    rating = models.IntegerField()
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # managed = False <-- REMOVE THIS
        db_table = 'reviews'

    def __str__(self):
        return f"{self.user.full_name} - {self.rating} stars"


class AdminLog(models.Model):
    log_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('RecycleUser', on_delete=models.CASCADE, db_column='user_id')
    action = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # managed = False <-- REMOVE THIS
        db_table = 'admin_logs'

    def __str__(self):
        return f"{self.action} by {self.user.full_name}"