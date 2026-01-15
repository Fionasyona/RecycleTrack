from rest_framework import serializers
from .models import WasteCategory

class WasteCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCategory
        fields = ['id', 'name', 'price_per_kg', 'description']