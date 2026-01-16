from django.db import models

class RecyclingCenter(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    
    # Coordinates for the Map
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    # Optional details
    phone = models.CharField(max_length=20, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to='centers/', blank=True, null=True)
    
    # What do they accept? (e.g., "Plastic, Glass, Metal")
    accepted_materials = models.TextField(help_text="Comma-separated list (e.g., Plastic, Paper)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name