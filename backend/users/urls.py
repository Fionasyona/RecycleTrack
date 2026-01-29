from django.urls import path
from .views import (
    CustomTokenObtainPairView, 
    register_user, 
    get_user_profile, 
    award_points, 
    get_leaderboard,
    create_pickup_request,
    get_pending_requests,
    verify_pickup_request,
    get_user_history,
    reject_pickup_request,
    get_all_users,
    toggle_user_status,
    change_password,
    get_all_collectors,
    assign_collector,
    get_collector_jobs,
    confirm_collection_job,
    create_collector,
    delete_collector,
    get_admin_history,
    get_collector_history,
    delete_my_account,
    initiate_payment, # <--- Added
)

urlpatterns = [
    # --- AUTH & PROFILE ---
    path('register/', register_user, name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', get_user_profile, name='user-profile'),
    path('change-password/', change_password, name='change-password'),
    path('profile/delete/', delete_my_account, name='delete_my_account'),

    # --- USER: PAYMENT ---
    path('payment/initiate/', initiate_payment, name='initiate_payment'),

    # --- ADMIN MANUAL ENTRY ---
    path('award-points/', award_points, name='award-points'),

    # --- LEADERBOARD ---
    path('leaderboard/', get_leaderboard, name='leaderboard'),

    # --- PICKUP REQUESTS ---
    path('pickup/create/', create_pickup_request, name='create_pickup'),
    path('pickup/pending/', get_pending_requests, name='pending_pickups'),
    path('pickup/verify/<int:request_id>/', verify_pickup_request, name='verify_pickup'),
    path('pickup/reject/<int:request_id>/', reject_pickup_request, name='reject_pickup'),
    
    # --- USER HISTORY ---
    path('history/', get_user_history, name='user_history'),

    # --- ADMIN: USER MANAGEMENT ---
    path('users/', get_all_users, name='get_all_users'),
    path('users/<int:user_id>/status/', toggle_user_status, name='toggle_user_status'),

    # --- COLLECTOR MANAGEMENT ---
    path('admin/collectors/', get_all_collectors, name='get_collectors'),
    path('pickup/assign/<int:request_id>/', assign_collector, name='assign_collector'),
    path('collector/jobs/', get_collector_jobs, name='collector_jobs'),
    path('collector/confirm/<int:request_id>/', confirm_collection_job, name='confirm_job'),

    path('admin/collectors/create/', create_collector, name='create_collector'),
    path('admin/collectors/<int:collector_id>/delete/', delete_collector, name='delete_collector'),

    # --- ADMIN & COLLECTOR HISTORY ---
    path('admin/history/', get_admin_history, name='admin_history'),
    path('collector/history/', get_collector_history, name='collector_history')
]