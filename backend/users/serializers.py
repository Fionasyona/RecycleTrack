from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# --- 1. USER SERIALIZER (For Registration) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'password', 'role', 'phone', 'address']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        email = validated_data['email']
        
        # FIX: We pass 'username=email' to satisfy Django's requirement
        user = User.objects.create_user(
            username=email, 
            email=email,
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            role=validated_data.get('role', 'resident')
        )
        return user

# --- 2. LOGIN SERIALIZER (Restored!) ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Map 'email' to 'username' so Django doesn't crash
        if 'email' in attrs:
            attrs['username'] = attrs['email']

        # Standard Django validation
        data = super().validate(attrs)

        # Add custom data to the response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'is_superuser': self.user.is_superuser
        }
        
        return data