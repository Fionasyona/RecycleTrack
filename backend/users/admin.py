from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    RecycleUser, 
    RecyclingLog, 
    PickupRequest, 
    RecyclingCenter, 
    Wallet, 
    WalletTransaction,
    DriverProfile,
    Notification
)

# --- 1. Custom User Admin ---
@admin.register(RecycleUser)
class CustomUserAdmin(UserAdmin):
    model = RecycleUser
    
    # Updated to show new points fields and wallet balance
    list_display = (
        'email', 
        'first_name', 
        'last_name', 
        'role', 
        'redeemable_points',  # New field (Spendable)
        'lifetime_points',    # New field (Status)
        'badge', 
        'is_staff',
        'get_wallet_balance'  # Custom function defined below
    )
    
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'badge')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone')
    
    # Layout for the "Edit User" page
    fieldsets = UserAdmin.fieldsets + (
        ('RecycleTrack Profile', {
            'fields': ('role', 'phone', 'address', 'redeemable_points', 'lifetime_points', 'badge', 'latitude', 'longitude')
        }),
    )
    
    # Layout for the "Add User" page
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('RecycleTrack Profile', {
            'fields': ('email', 'role', 'phone', 'address', 'redeemable_points', 'lifetime_points')
        }),
    )

    # Custom function to show wallet balance in user list
    def get_wallet_balance(self, obj):
        if hasattr(obj, 'wallet'):
            return f"KES {obj.wallet.balance}"
        return "N/A"
    get_wallet_balance.short_description = 'Wallet Balance'

# --- 2. Wallet Admin (NEW) ---
class WalletTransactionInline(admin.TabularInline):
    model = WalletTransaction
    extra = 0
    readonly_fields = ('transaction_type', 'amount', 'status', 'timestamp', 'description')
    can_delete = False

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'balance', 'last_updated')
    search_fields = ('user__email', 'user__username')
    readonly_fields = ('last_updated',)
    inlines = [WalletTransactionInline] # Shows transaction history inside the wallet page

@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = ('wallet', 'transaction_type', 'amount', 'status', 'timestamp')
    list_filter = ('transaction_type', 'status', 'timestamp')
    search_fields = ('wallet__user__email', 'reference_code')

# --- 3. Recycling Log Admin ---
@admin.register(RecyclingLog)
class RecyclingLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'waste_type', 'quantity', 'points_awarded', 'date')
    list_filter = ('date', 'waste_type')
    search_fields = ('user__username', 'user__email', 'description')

# --- 4. Pickup Request Admin ---
@admin.register(PickupRequest)
class PickupRequestAdmin(admin.ModelAdmin):
    # Added billed_amount and is_paid to list
    list_display = ('user', 'waste_type', 'quantity', 'scheduled_date', 'status', 'collector', 'center', 'billed_amount', 'is_paid')
    list_filter = ('status', 'scheduled_date', 'waste_type', 'is_paid')
    search_fields = ('user__username', 'user__email', 'center__name')
    ordering = ('-scheduled_date',)

# --- 5. Recycling Center Admin ---
@admin.register(RecyclingCenter)
class RecyclingCenterAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'contact_info', 'latitude', 'longitude')
    search_fields = ('name', 'address')

# --- 6. Driver Profile & Notification Admin ---
@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'id_no', 'license_no', 'is_verified', 'total_earned')
    list_filter = ('is_verified',)
    search_fields = ('user__email', 'id_no', 'license_no')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__email', 'message')