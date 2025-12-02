from django.db import models


class RecycleUser(models.Model):
    user_id = models.AutoField(primary_key=True)  # Changed from default 'id'
    full_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    password_hash = models.CharField(max_length=255)
    address = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(
        max_length=20,
        choices=[
            ('resident', 'Resident'),
            ('service_provider', 'Service Provider'),
            ('admin', 'Admin')
        ],
        default='resident'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'users'

    def __str__(self):
        return self.full_name


class ServiceProvider(models.Model):
    provider_id = models.AutoField(primary_key=True)  # Added
    user = models.ForeignKey(RecycleUser, on_delete=models.CASCADE, db_column='user_id')
    company_name = models.CharField(max_length=150)  # Was 'service_name'
    service_type = models.CharField(max_length=100, null=True, blank=True)  # Added
    location = models.CharField(max_length=255, null=True, blank=True)
    license_number = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'service_providers'

    def __str__(self):
        return self.company_name


class Review(models.Model):
    review_id = models.AutoField(primary_key=True)  # Added
    provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE, db_column='provider_id')  # Fixed name
    user = models.ForeignKey(RecycleUser, on_delete=models.CASCADE, db_column='user_id')
    rating = models.IntegerField()
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'reviews'

    def __str__(self):
        return f"{self.user.full_name} - {self.rating} stars"


class AdminLog(models.Model):
    log_id = models.AutoField(primary_key=True)  # Added
    user = models.ForeignKey(RecycleUser, on_delete=models.CASCADE, db_column='user_id')  # Renamed from admin_user
    action = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)  # Was 'timestamp'

    class Meta:
        managed = False
        db_table = 'admin_logs'

    def __str__(self):
        return f"{self.action} by {self.user.full_name}"