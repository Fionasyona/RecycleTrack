from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import PickupRequest, RecyclingCenter, Payment, DriverProfile

User = get_user_model()

# --- 1. DRIVER PROFILE SERIALIZER ---
class DriverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = ['id_no', 'license_no', 'is_verified', 'total_earned']
        read_only_fields = ['is_verified', 'total_earned']

# --- 2. USER SERIALIZER (Registration & Profile) ---
class UserSerializer(serializers.ModelSerializer):
    badge = serializers.ReadOnlyField()
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    driver_profile = DriverProfileSerializer(read_only=True)
    
    # Write-only fields for registration input
    location = serializers.CharField(write_only=True, required=False, allow_blank=True)
    full_name_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'full_name_input', 'first_name', 'last_name', 
            'password', 'role', 'phone', 'address', 'location', 'points', 'badge', 'date_joined',
            'is_active', 'driver_profile'
        ]
        read_only_fields = ['id', 'points', 'badge', 'date_joined', 'driver_info']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        email = validated_data['email'] 
        full_name_raw = validated_data.pop('full_name_input', '') or self.initial_data.get('full_name', '')
        
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')

        if full_name_raw and not first_name:
            parts = full_name_raw.strip().split(' ', 1)
            first_name = parts[0]
            if len(parts) > 1: last_name = parts[1]

        user = User.objects.create_user(
            username=email, # Django uses 'username' internally for the primary identifier
            email=email,
            password=validated_data['password'],
            first_name=first_name, 
            last_name=last_name,   
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', '') or validated_data.get('location', ''),
            role=validated_data.get('role', 'resident')
        )
        return user

# --- 3. LOGIN SERIALIZER (The 400 Error Fix) ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # These fields must be explicitly defined to match your React Login payload
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, attrs):
        # IMPORTANT: Django's authenticate() looks for 'username'
        # We manually copy the 'email' value to 'username' here
        attrs['username'] = attrs.get('email')
        
        # Now super().validate will work because 'username' is present
        data = super().validate(attrs)

        # Include custom data for your React Frontend/AuthContext
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'full_name': self.user.get_full_name(), 
            'role': self.user.role,
            'points': self.user.points,
            'badge': self.user.badge,
            'phone': self.user.phone,     
            'address': self.user.address,
            'is_verified_driver': getattr(self.user.driver_profile, 'is_verified', False) if self.user.role == 'service_provider' else None
        }
        return data

# --- 4. PICKUP REQUEST SERIALIZER ---
class PickupRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    user_full_name = serializers.ReadOnlyField(source='user.get_full_name')
    collector_name = serializers.ReadOnlyField(source='collector.get_full_name')
    center_name = serializers.CharField(source='center.name', read_only=True)
    payment_status = serializers.SerializerMethodField()

    def get_payment_status(self, obj):
        return "Paid" if Payment.objects.filter(pickup_request=obj, status='completed').exists() else "Unpaid"

    class Meta:
        model = PickupRequest
        fields = [
            'id', 'user', 'user_email', 'user_full_name', 
            'waste_type', 'quantity', 'scheduled_date', 'status', 
            'created_at', 'rejection_reason',
            'collector', 'collector_name',
            'center', 'center_name', 
            'latitude', 'longitude',
            'pickup_address', 'region',
            'assigned_at', 'payment_status',
            'rating', 'was_on_time', 'review_text'
        ]
        read_only_fields = ['status', 'collector', 'created_at', 'user', 'assigned_at']

# --- 5. UTILITY SERIALIZERS ---
class RecyclingCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecyclingCenter
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'