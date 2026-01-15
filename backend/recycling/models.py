from django.db import models

class WasteCategory(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Plastic"
    price_per_kg = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name