from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
# UPDATED IMPORTS: Added WithdrawalRequest
from .models import PickupRequest, DriverProfile, Notification, Wallet, WalletTransaction, WithdrawalRequest

User = get_user_model()

# --- 1. NOTIFICATION SERIALIZER ---
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']

# --- 2. WALLET SERIALIZERS ---
class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ['id', 'transaction_type', 'amount', 'status', 'timestamp', 'description']

class WalletSerializer(serializers.ModelSerializer):
    transactions = WalletTransactionSerializer(many=True, read_only=True)
    class Meta:
        model = Wallet
        fields = ['balance', 'last_updated', 'transactions']

# --- 3. DRIVER PROFILE SERIALIZER ---
class DriverProfileSerializer(serializers.ModelSerializer):
    total_earned = serializers.FloatField(read_only=True)

    class Meta:
        model = DriverProfile
        fields = ['id_no', 'license_no', 'is_verified', 'total_earned']

# --- 4. USER SERIALIZER ---
class UserSerializer(serializers.ModelSerializer):
    driver_profile = DriverProfileSerializer(read_only=True)
    wallet_balance = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'password',
            'first_name', 'last_name', 'full_name', 
            'phone', 'role', 
            'redeemable_points', 'lifetime_points',
            'badge', 'address', 
            'latitude', 'longitude', 'is_active', 
            'driver_profile', 'wallet_balance'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.email.split('@')[0]

    def get_wallet_balance(self, obj):
        if hasattr(obj, 'wallet'):
            return float(obj.wallet.balance)
        return 0.00

    def create(self, validated_data):
        if 'email' in validated_data:
            email = validated_data['email'].lower().strip()
            validated_data['email'] = email
            validated_data['username'] = email

        password = validated_data.pop('password', None)
        user = User(**validated_data)
        
        if password:
            user.set_password(password)
        
        user.is_active = True
        user.save()
        return user

# --- 5. PICKUP REQUEST SERIALIZER ---
class PickupRequestSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    user_full_name = serializers.SerializerMethodField()
    center_name = serializers.SerializerMethodField()
    billed_amount = serializers.FloatField(read_only=True)
    actual_quantity = serializers.FloatField(read_only=True)
    
    class Meta:
        model = PickupRequest
        fields = [
            'id', 'user', 'user_full_name', 'center', 'center_name', 'collector', 
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

    def get_center_name(self, obj):
        return obj.center.name if obj.center else None

# --- NEW: WITHDRAWAL REQUEST SERIALIZER (This was missing) ---
class WithdrawalRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    points_used = serializers.SerializerMethodField()

    class Meta:
        model = WithdrawalRequest
        fields = ['id', 'user_name', 'user_email', 'amount', 'mpesa_number', 'status', 'created_at', 'points_used']

    def get_points_used(self, obj):
        # Calculate points used based on amount (Amount / 0.3)
        return int(obj.amount / 0.3)

# --- 6. AUTH SERIALIZER ---
class CustomTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)

            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }