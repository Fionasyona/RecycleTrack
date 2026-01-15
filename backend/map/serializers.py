# backend/map/serializers.py
from rest_framework import serializers
from .models import RecyclingCenter, CenterService, UserActivityLocation, CenterReview


class CenterServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CenterService
        fields = ['service_id', 'service_name']


class RecyclingCenterSerializer(serializers.ModelSerializer):
    services = serializers.SerializerMethodField()
    lat = serializers.DecimalField(source='latitude', max_digits=9, decimal_places=6)
    lng = serializers.DecimalField(source='longitude', max_digits=9, decimal_places=6)
    distance = serializers.SerializerMethodField()
    
    class Meta:
        model = RecyclingCenter
        fields = [
            'center_id', 'name', 'type', 'address', 
            'lat', 'lng', 'phone', 'email', 'open_hours',
            'rating', 'total_reviews', 'services', 'distance',
            'is_active', 'created_at'
        ]
        read_only_fields = ['center_id', 'rating', 'total_reviews', 'created_at']
    
    def get_services(self, obj):
        """Get list of service names"""
        return [service.service_name for service in obj.services.all()]
    
    def get_distance(self, obj):
        """Calculate distance if user location is provided in context"""
        user_location = self.context.get('user_location')
        if user_location:
            lat = user_location.get('lat')
            lng = user_location.get('lng')
            if lat and lng:
                distance = obj.calculate_distance(lat, lng)
                return distance
        return None


class RecyclingCenterCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating recycling centers"""
    services = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = RecyclingCenter
        fields = [
            'name', 'type', 'address', 'latitude', 'longitude',
            'phone', 'email', 'open_hours', 'services', 'is_active'
        ]
    
    def create(self, validated_data):
        services = validated_data.pop('services', [])
        center = RecyclingCenter.objects.create(**validated_data)
        
        # Create services
        for service_name in services:
            CenterService.objects.create(
                center=center,
                service_name=service_name
            )
        
        return center
    
    def update(self, instance, validated_data):
        services = validated_data.pop('services', None)
        
        # Update center fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update services if provided
        if services is not None:
            # Remove old services
            instance.services.all().delete()
            # Add new services
            for service_name in services:
                CenterService.objects.create(
                    center=instance,
                    service_name=service_name
                )
        
        return instance


class UserActivityLocationSerializer(serializers.ModelSerializer):
    lat = serializers.DecimalField(source='latitude', max_digits=9, decimal_places=6)
    lng = serializers.DecimalField(source='longitude', max_digits=9, decimal_places=6)
    
    class Meta:
        model = UserActivityLocation
        fields = [
            'location_id', 'activity_type', 'description',
            'lat', 'lng', 'points_earned', 'created_at'
        ]
        read_only_fields = ['location_id', 'created_at']


class CenterReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    center_name = serializers.CharField(source='center.name', read_only=True)
    
    class Meta:
        model = CenterReview
        fields = [
            'review_id', 'center', 'center_name', 'user',
            'user_name', 'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['review_id', 'user', 'created_at']
    
    def validate_rating(self, value):
        """Ensure rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value