from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import PickupRequest, RecyclingCenter, Payment

User = get_user_model()

# --- 1. USER SERIALIZER (Registration & Profile) ---
class UserSerializer(serializers.ModelSerializer):
    badge = serializers.ReadOnlyField()
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    # Write-only fields to capture input during registration
    location = serializers.CharField(write_only=True, required=False, allow_blank=True)
    full_name_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'full_name_input', 'first_name', 'last_name', 
            'password', 'role', 'phone', 'address', 'location', 'points', 'badge', 'date_joined',
            'is_active'
        ]
        read_only_fields = ['id', 'points', 'badge', 'role', 'date_joined']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        email = validated_data['email'] 
        
        # --- NAME HANDLING FIX ---
        # 1. robustly get the name from various possible input fields
        full_name_raw = (
            validated_data.pop('full_name_input', '') or 
            self.initial_data.get('full_name', '') or 
            self.initial_data.get('name', '')
        )

        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')

        # 2. If we found a full name string but no explicit first/last, split it
        if full_name_raw and not first_name and not last_name:
            name_parts = full_name_raw.strip().split(' ', 1) 
            first_name = name_parts[0]
            if len(name_parts) > 1:
                last_name = name_parts[1]
        # -------------------------

        address = validated_data.get('address', '') or validated_data.get('location', '')

        user = User.objects.create_user(
            username=email, 
            email=email,
            password=validated_data['password'],
            first_name=first_name, 
            last_name=last_name,   
            phone=validated_data.get('phone', ''),
            address=address,
            role=validated_data.get('role', 'resident')
        )
        return user

# --- 2. LOGIN SERIALIZER (Fixed 500 Error) ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # CRITICAL FIX: Define email explicitly so it isn't stripped out by validation
    email = serializers.EmailField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make username optional since we are using email
        if 'username' in self.fields:
            self.fields['username'].required = False

    def validate(self, attrs):
        # 1. Map Email to Username
        if 'email' in attrs:
            attrs['username'] = attrs['email']

        # 2. Run standard validation (checks password against username)
        # This will no longer crash because 'username' now exists in attrs
        data = super().validate(attrs)

        # 3. Add Custom User Data to Response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'full_name': self.user.get_full_name(), 
            'role': self.user.role,
            'points': self.user.points,
            'badge': self.user.badge,
            'phone': self.user.phone,     
            'address': self.user.address, 
        }
        return data

# --- 3. OTHER SERIALIZERS ---
class RecyclingCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecyclingCenter
        fields = '__all__'

class PickupRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    user_full_name = serializers.ReadOnlyField(source='user.get_full_name')
    collector_name = serializers.ReadOnlyField(source='collector.get_full_name')
    center_name = serializers.CharField(source='center.name', read_only=True)
    
    payment_status = serializers.SerializerMethodField()

    def get_payment_status(self, obj):
        payment = Payment.objects.filter(pickup_request=obj, status='completed').first()
        if payment: return "Paid"
        return "Unpaid"

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
            'payment_status',
            'assigned_at'
        ]
        read_only_fields = ['status', 'collector', 'created_at', 'user', 'assigned_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'