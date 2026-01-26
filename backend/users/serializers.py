from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import PickupRequest 

User = get_user_model()

# --- 1. USER SERIALIZER ---
class UserSerializer(serializers.ModelSerializer):
    badge = serializers.ReadOnlyField()
    
    # Explicitly allow 'location' as an input (maps to address)
    location = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'first_name', 'last_name', 
            'password', 'role', 'phone', 'address', 'location', 'points', 'badge', 'date_joined',
            'is_active'
        ]
        
        # FIX: Removed 'email' from this list so we can register new users
        read_only_fields = ['id', 'points', 'badge', 'role', 'date_joined']
        
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Now this line will work because email is allowed in validated_data
        email = validated_data['email'] 
        full_name = validated_data.get('full_name', '')

        # 1. Smart Split for Name
        first_name = validated_data.get('first_name', '')
        last_name = validated_data.get('last_name', '')

        if full_name and not first_name and not last_name:
            name_parts = full_name.strip().split(' ', 1) 
            first_name = name_parts[0]
            if len(name_parts) > 1:
                last_name = name_parts[1]

        # 2. Smart Map for Address
        address = validated_data.get('address', '') or validated_data.get('location', '')

        user = User.objects.create_user(
            username=email, 
            email=email,
            password=validated_data['password'],
            full_name=full_name,
            first_name=first_name, 
            last_name=last_name,   
            phone=validated_data.get('phone', ''),
            address=address,
            role=validated_data.get('role', 'resident')
        )
        return user

# --- 2. LOGIN SERIALIZER ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        if 'email' in attrs:
            attrs['username'] = attrs['email']

        data = super().validate(attrs)

        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name, 
            'last_name': self.user.last_name,   
            'full_name': self.user.full_name,
            'role': self.user.role,
            'points': self.user.points,
            'badge': self.user.badge,
            'is_superuser': self.user.is_superuser,
            'phone': self.user.phone,     
            'address': self.user.address, 
            'location': self.user.address 
        }
        
        return data

# --- 3. PICKUP REQUEST SERIALIZER ---
class PickupRequestSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    user_full_name = serializers.ReadOnlyField(source='user.full_name')
    collector_name = serializers.ReadOnlyField(source='collector.full_name')

    class Meta:
        model = PickupRequest
        fields = [
            'id', 'user_email', 'user_full_name', 'center_name', 
            'waste_type', 'quantity', 'scheduled_date', 'status', 
            'created_at', 'rejection_reason',
            'collector_name', # <-- Vital for Frontend
            'collector'
        ]