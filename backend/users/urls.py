from django.urls import path
from .views import (
    CustomTokenObtainPairView, 
    register_user, 
    get_user_profile, 
    get_leaderboard,
    create_pickup_request,
    get_pending_requests,
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
    initiate_payment,
    register_driver_docs,
    admin_verify_and_pay,
    verify_driver,
    get_driver_wallet,
)

urlpatterns = [
    # --- AUTH & PROFILE ---
    path('register/', register_user, name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('profile/', get_user_profile, name='user-profile'),
    path('change-password/', change_password, name='change-password'),
    path('profile/delete/', delete_my_account, name='delete_my_account'),

    # --- USER: PAYMENT & REVIEWS ---
    path('payment/initiate/', initiate_payment, name='initiate_payment'),

    # --- LEADERBOARD ---
    path('leaderboard/', get_leaderboard, name='leaderboard'),

    # --- PICKUP REQUESTS ---
    path('pickup/create/', create_pickup_request, name='create_pickup'),
    path('pickup/pending/', get_pending_requests, name='pending_pickups'),
    path('pickup/reject/<int:request_id>/', reject_pickup_request, name='reject_pickup'),
    
    # --- USER HISTORY ---
    path('history/', get_user_history, name='user_history'),

    # --- ADMIN: USER & COLLECTOR MANAGEMENT ---
    path('users/', get_all_users, name='get_all_users'),
    path('users/<int:user_id>/status/', toggle_user_status, name='toggle_user_status'),
    path('admin/collectors/', get_all_collectors, name='get_collectors'),
    path('admin/collectors/create/', create_collector, name='create_collector'),
    path('admin/collectors/<int:collector_id>/delete/', delete_collector, name='delete_collector'),
    
    # --- ADMIN: DRIVER VERIFICATION ---
    path('admin/verify-driver/<int:driver_id>/', verify_driver, name='verify_driver'), # <-- NEW PATH

    # --- DRIVER/COLLECTOR WORKFLOW ---
    path('driver/register-docs/', register_driver_docs, name='register_driver_docs'),
    path('pickup/assign/<int:request_id>/', assign_collector, name='assign_collector'),
    path('collector/jobs/', get_collector_jobs, name='collector_jobs'),
    path('collector/confirm/<int:request_id>/', confirm_collection_job, name='confirm_job'),
    path('driver/wallet/', get_driver_wallet, name='driver_wallet'),

    # --- ADMIN VERIFICATION & Payout ---
   path('pickup/verify/<int:request_id>/', admin_verify_and_pay, name='admin_verify_and_pay'),

    # --- HISTORY ---
    path('admin/history/', get_admin_history, name='admin_history'),
    path('collector/history/', get_collector_history, name='collector_history')
]