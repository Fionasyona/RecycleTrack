from rest_framework import serializers
# FIX: Import 'RecycleUser' instead of 'User'
from .models import RecycleUser, ServiceProvider, Review, AdminLog

class RecycleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecycleUser
        fields = ['user_id', 'full_name', 'email', 'phone', 'role', 'address', 'created_at']

class ServiceProviderSerializer(serializers.ModelSerializer):
    # Optional: Display user details inside the provider object
    user_details = RecycleUserSerializer(source='user', read_only=True)

    class Meta:
        model = ServiceProvider
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'

class AdminLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = AdminLog
        fields = '__all__'