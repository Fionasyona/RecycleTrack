from rest_framework import serializers
from .models import WasteCategory, DisposalReport


class WasteCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCategory
        fields = '__all__'


class DisposalReportSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)    
    class Meta:
        model = DisposalReport
        fields = '__all__'
