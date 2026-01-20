from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# --- 1. USER SERIALIZER ---
class UserSerializer(serializers.ModelSerializer):
    # Include badge (read-only property)
    badge = serializers.ReadOnlyField() 
    
    class Meta:
        model = User
        # Added 'first_name' and 'last_name' so they can be updated from frontend
        fields = [
            'id', 'email', 'full_name', 'first_name', 'last_name', 
            'password', 'role', 'phone', 'address', 'points', 'badge', 'date_joined'
        ]
        
        # Security: Prevent users from editing these fields via API
        read_only_fields = ['id', 'email', 'points', 'badge', 'role', 'date_joined']
        
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        email = validated_data['email']
        user = User.objects.create_user(
            username=email, 
            email=email,
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            role=validated_data.get('role', 'resident')
        )
        return user

# --- 2. LOGIN SERIALIZER ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        if 'email' in attrs:
            attrs['username'] = attrs['email']

        data = super().validate(attrs)

        # Add custom data to the response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name, # Added for frontend context
            'last_name': self.user.last_name,   # Added for frontend context
            'full_name': self.user.full_name,
            'role': self.user.role,
            'points': self.user.points,
            'badge': self.user.badge,
            'is_superuser': self.user.is_superuser
        }
        
        return data