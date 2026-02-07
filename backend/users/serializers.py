from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PickupRequest, DriverProfile, Notification

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']

class DriverProfileSerializer(serializers.ModelSerializer):
    # FIX: Force total_earned to be a Float to ensure frontend shows numbers correctly
    total_earned = serializers.FloatField(read_only=True)

    class Meta:
        model = DriverProfile
        fields = ['id_no', 'license_no', 'is_verified', 'total_earned']

class UserSerializer(serializers.ModelSerializer):
    driver_profile = DriverProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 
            'phone', 'role', 'points', 'badge', 'address', 
            'latitude', 'longitude', 'is_active', 'driver_profile'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.email.split('@')[0]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

class PickupRequestSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    user_full_name = serializers.SerializerMethodField()
    
    billed_amount = serializers.FloatField(read_only=True)
    actual_quantity = serializers.FloatField(read_only=True)
    
    class Meta:
        model = PickupRequest
        fields = [
            'id', 'user', 'user_full_name', 'center', 'collector', 
            'waste_type', 'quantity', 'scheduled_date', 'status',
            'pickup_address', 'region', 'latitude', 'longitude',
            'assigned_at', 'rating', 'was_on_time', 'review_text', 
            'rejection_reason', 'created_at', 
            'billed_amount', 'actual_quantity', 'is_paid'
        ]

    def get_user_full_name(self, obj):
        if obj.user:
            name = f"{obj.user.first_name} {obj.user.last_name}".strip()
            return name if name else obj.user.email.split('@')[0]
        return "Unknown User"

class CustomTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        from django.contrib.auth import authenticate
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }

class PaymentSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    phone = serializers.CharField(max_length=15)