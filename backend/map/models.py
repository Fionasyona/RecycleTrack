# backend/map/models.py
from django.db import models
from django.conf import settings  # <--- CHANGED: Import settings instead of RecycleUser
from decimal import Decimal
import math

class RecyclingCenter(models.Model):
    TYPE_CHOICES = [
        ('recycling_center', 'Recycling Center'),
        ('collection_point', 'Collection Point'),
    ]
    
    center_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    address = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    open_hours = models.CharField(max_length=100, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_reviews = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'recycling_centers'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.type})"
    
    def calculate_distance(self, lat, lng):
        """
        Calculate distance between this center and given coordinates
        Using Haversine formula - returns distance in meters
        """
        R = 6371000  # Earth's radius in meters
        
        lat1 = math.radians(float(self.latitude))
        lat2 = math.radians(float(lat))
        delta_lat = math.radians(float(lat) - float(self.latitude))
        delta_lng = math.radians(float(lng) - float(self.longitude))
        
        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1) * math.cos(lat2) *
             math.sin(delta_lng / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        distance = R * c  # Distance in meters
        return round(distance, 2)


class CenterService(models.Model):
    """Services offered by recycling centers"""
    service_id = models.AutoField(primary_key=True)
    center = models.ForeignKey(
        RecyclingCenter, 
        on_delete=models.CASCADE, 
        related_name='services',
        db_column='center_id'
    )
    service_name = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'center_services'
        unique_together = ['center', 'service_name']
    
    def __str__(self):
        return f"{self.center.name} - {self.service_name}"


class UserActivityLocation(models.Model):
    """
    Stores location data for user activities
    Links to Activity from gamification app
    """
    location_id = models.AutoField(primary_key=True)
    
    # <--- CHANGED: Use settings.AUTH_USER_MODEL
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    activity_type = models.CharField(max_length=50)
    description = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activity_locations'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user} - {self.activity_type}"


class CenterReview(models.Model):
    """User reviews for recycling centers"""
    review_id = models.AutoField(primary_key=True)
    center = models.ForeignKey(
        RecyclingCenter,
        on_delete=models.CASCADE,
        related_name='reviews',
        db_column='center_id'
    )
    
    # <--- CHANGED: Use settings.AUTH_USER_MODEL
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    rating = models.IntegerField()  # 1-5 stars
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'center_reviews'
        unique_together = ['center', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user} - {self.center.name} ({self.rating}★)"
    
    def save(self, *args, **kwargs):
        """Update center rating when review is saved"""
        super().save(*args, **kwargs)
        self.center.update_rating()


# Extend RecyclingCenter model with rating update method
def update_rating(self):
    """Calculate average rating from all reviews"""
    reviews = self.reviews.all()
    if reviews.exists():
        total = sum(r.rating for r in reviews)
        self.rating = Decimal(total / reviews.count())
        self.total_reviews = reviews.count()
        self.save(update_fields=['rating', 'total_reviews'])

RecyclingCenter.update_rating = update_rating