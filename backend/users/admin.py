from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import RecycleUser, RecyclingLog, PickupRequest, RecyclingCenter

# --- 1. Custom User Admin ---
@admin.register(RecycleUser)
class CustomUserAdmin(UserAdmin):
    model = RecycleUser
    
    # Columns to show in the list view
    # Changed 'full_name' to 'first_name' and 'last_name' to match Django defaults
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'points', 'badge', 'is_staff')
    
    # Filters sidebar
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    
    # Search bar config
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone')
    
    # Layout for the "Edit User" page
    fieldsets = UserAdmin.fieldsets + (
        ('RecycleTrack Profile', {'fields': ('role', 'phone', 'address', 'points', 'badge')}),
    )
    
    # Layout for the "Add User" page (Crucial for Custom User Models)
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('RecycleTrack Profile', {'fields': ('email', 'role', 'phone', 'address')}),
    )

# --- 2. Recycling Log Admin ---
@admin.register(RecyclingLog)
class RecyclingLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'waste_type', 'quantity', 'points_awarded', 'date')
    list_filter = ('date', 'waste_type')
    search_fields = ('user__username', 'user__email', 'description')

# --- 3. Pickup Request Admin ---
@admin.register(PickupRequest)
class PickupRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'waste_type', 'quantity', 'scheduled_date', 'status', 'collector', 'center')
    list_filter = ('status', 'scheduled_date', 'waste_type')
    search_fields = ('user__username', 'user__email', 'center__name')
    ordering = ('-scheduled_date',)

# --- 4. Recycling Center Admin ---
@admin.register(RecyclingCenter)
class RecyclingCenterAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'contact_info', 'latitude', 'longitude')
    search_fields = ('name', 'address')