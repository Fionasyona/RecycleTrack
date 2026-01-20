from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import RecycleUser, RecyclingLog

# Register the User Model with the default UserAdmin features
@admin.register(RecycleUser)
class CustomUserAdmin(UserAdmin):
    # What columns to show in the list
    list_display = ('email', 'full_name', 'role', 'points', 'badge', 'is_staff')
    
    # Add filters on the right side
    list_filter = ('role', 'is_staff', 'is_superuser')
    
    # Allow searching by name or email
    search_fields = ('email', 'full_name', 'phone')
    
    # Add your custom fields to the "Edit User" form
    fieldsets = UserAdmin.fieldsets + (
        ('RecycleTrack Profile', {'fields': ('role', 'phone', 'address', 'points')}),
    )

# Register the Recycling Log so you can verify drop-offs
@admin.register(RecyclingLog)
class RecyclingLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'points_awarded', 'date', 'description')
    list_filter = ('date',)
    search_fields = ('user__email', 'user__full_name')