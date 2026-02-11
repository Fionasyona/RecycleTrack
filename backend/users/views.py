from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction
from django.db.models import F, Sum, Q 
from decimal import Decimal
from .serializers import (
    UserSerializer, 
    CustomTokenObtainPairSerializer, 
    PickupRequestSerializer, 
    NotificationSerializer
)
from .models import (
    RecyclingCenter, 
    RecyclingLog, 
    PickupRequest, 
    Wallet, 
    WalletTransaction, 
    DriverProfile, 
    Notification
)
import uuid
import random 

User = get_user_model()

# --- CONFIGURATION ---
WASTE_PRICES = {
    'Plastic': 50,  # KES per KG
    'Paper': 30,
    'Metal': 100,
    'Glass': 40,
    'E-waste': 200
}

# Points awarded per verification (independent of weight)
POINTS_CONFIG = {
    'Plastic': 20,
    'Glass': 15,
    'Paper': 10,
    'Metal': 30,
    'E-waste': 50
}

# --- 1. AUTHENTICATION ---
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Randomize location slightly for demo purposes
        user.latitude = -1.2921 + random.uniform(-0.05, 0.05)
        user.longitude = 36.8219 + random.uniform(-0.05, 0.05)
        user.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    if not user.check_password(request.data.get('old_password')):
        return Response({"error": "Incorrect password"}, status=400)
    user.set_password(request.data.get('new_password'))
    user.save()
    return Response({"message": "Password changed"})

# --- 2. USER PROFILE & LEADERBOARD ---
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard(request):
    # Leaderboard is based on LIFETIME points (Status)
    leaders = User.objects.filter(role='resident', is_staff=False).order_by('-lifetime_points')[:20]
    return Response(UserSerializer(leaders, many=True).data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_my_account(request):
    request.user.delete()
    return Response({"message": "Account deleted"})

# --- 3. DRIVER WORKFLOW ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_driver_docs(request):
    if request.user.role != 'service_provider':
        return Response({"error": "Unauthorized role"}, status=403)
    profile, created = DriverProfile.objects.get_or_create(user=request.user)
    profile.id_no = request.data.get('id_no')
    profile.license_no = request.data.get('license_no')
    profile.save()
    return Response({"message": "Documents submitted for verification."})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_collector_jobs(request):
    if request.user.role != 'service_provider':
        return Response({"error": "Unauthorized"}, status=403)
    jobs = PickupRequest.objects.filter(collector=request.user, status__in=['assigned', 'collected']).order_by('-scheduled_date')
    return Response(PickupRequestSerializer(jobs, many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def confirm_collection_job(request, request_id):
    job = get_object_or_404(PickupRequest, id=request_id, collector=request.user)
    if job.status != 'assigned':
        return Response({"error": "Job is not in assigned state"}, status=400)
    job.status = 'collected'
    job.save()
    return Response({"message": "Confirmed."})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def bill_collection_job(request, request_id):
    job = get_object_or_404(PickupRequest, id=request_id, collector=request.user)
    
    if job.status != 'assigned':
        return Response({"error": "Job must be assigned first"}, status=400)

    try:
        actual_weight = float(request.data.get('weight', 0))
    except ValueError:
        return Response({"error": "Invalid weight"}, status=400)

    if actual_weight <= 0:
        return Response({"error": "Weight must be greater than 0"}, status=400)

    # Calculate Bill
    price_per_unit = WASTE_PRICES.get(job.waste_type, 50)
    bill_total = actual_weight * price_per_unit
    
    # Ensure bill isn't 0
    if bill_total <= 0:
        bill_total = 50.0 

    # Update Job
    job.actual_quantity = actual_weight
    job.billed_amount = bill_total
    job.status = 'collected' 
    job.save()

    # Notify User
    Notification.objects.create(
        user=job.user,
        message=f"Pickup Complete! Weight: {actual_weight}kg. Total Bill: KES {bill_total}. Please go to your dashboard to pay.",
        pickup=job
    )

    return Response({
        "message": "Bill sent to user", 
        "amount": bill_total, 
        "weight": actual_weight
    })

# --- 4. PICKUP REQUESTS ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_pickup_request(request):
    data = request.data.copy()
    
    center_name = data.get('center_name')
    if center_name:
        center_obj = RecyclingCenter.objects.filter(name=center_name).first()
        if center_obj:
            data['center'] = center_obj.id 
    
    if not data.get('quantity'):
        data['quantity'] = "Pending Weighing"

    serializer = PickupRequestSerializer(data=data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_history(request):
    pending = PickupRequest.objects.filter(user=request.user, status__in=['pending', 'assigned', 'collected', 'cancelled']).order_by('-created_at')
    logs = RecyclingLog.objects.filter(user=request.user).order_by('-date')
    history_data = [{'id': l.id, 'type': 'completed', 'date': l.date, 'waste_type': l.waste_type, 'quantity': l.quantity, 'points': l.points_awarded, 'status': 'Verified'} for l in logs]
    return Response({"pending": PickupRequestSerializer(pending, many=True).data, "history": history_data})

# --- 5. ADMIN ACTIONS ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_pending_requests(request):
    requests = PickupRequest.objects.exclude(status__in=['verified', 'paid', 'cancelled']).order_by('scheduled_date')
    return Response(PickupRequestSerializer(requests, many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def assign_collector(request, request_id):
    pickup = get_object_or_404(PickupRequest, id=request_id)
    collector_id = request.data.get('collector_id')
    
    if not collector_id:
        return Response({"error": "Collector ID is required"}, status=400)
        
    collector = get_object_or_404(User, id=collector_id, role='service_provider')
    
    pickup.collector = collector
    pickup.status = 'assigned'
    pickup.assigned_at = timezone.now()
    pickup.save()
    
    Notification.objects.create(
        user=pickup.user,
        message=f"Your pickup request for {pickup.waste_type} has been assigned to driver {collector.first_name}.",
        pickup=pickup
    )
    Notification.objects.create(
        user=collector,
        message=f"New Job Assigned: {pickup.waste_type} in {pickup.region}.",
        pickup=pickup
    )
    
    return Response({"message": f"Assigned to {collector.get_full_name()}"})

# --- ADMIN VERIFY (POINTS & REWARDS LOGIC) ---
@api_view(['POST'])
@permission_classes([IsAdminUser])
@transaction.atomic
def admin_verify_and_pay(request, request_id):
    pickup = get_object_or_404(PickupRequest, id=request_id)
    
    # Requirement: User must have paid the bill before verification
    if not pickup.is_paid:
        return Response({"error": "User has not paid the bill yet."}, status=400)

    if pickup.status == 'verified':
        return Response({"error": "Job already verified."}, status=400)

    # 1. Driver Payout Logic
    user_paid_amount = Decimal(str(pickup.billed_amount))
    DRIVER_BASE_FEE = Decimal("100.00")
    COMMISSION_RATE = Decimal("0.20")
    driver_payout = DRIVER_BASE_FEE + (user_paid_amount * COMMISSION_RATE)

    # 2. User Reward Logic (UPDATED)
    earned_points = POINTS_CONFIG.get(pickup.waste_type, 10)
    
    # Update BOTH points
    pickup.user.redeemable_points = F('redeemable_points') + earned_points
    pickup.user.lifetime_points = F('lifetime_points') + earned_points
    pickup.user.save() 
    
    # Refresh to check badge status based on lifetime_points
    pickup.user.refresh_from_db()
    pickup.user.update_badge() 

    # 3. Pay Driver
    if pickup.collector:
        driver_profile, _ = DriverProfile.objects.get_or_create(
            user=pickup.collector,
            defaults={'total_earned': 0.00, 'id_no': f'FIX-{pickup.collector.id}', 'license_no': f'FIX-{pickup.collector.id}'}
        )
        current = Decimal(str(driver_profile.total_earned))
        driver_profile.total_earned = current + driver_payout
        driver_profile.save()
        
        Notification.objects.create(
            user=pickup.collector,
            message=f"Job #{pickup.id} Verified. KES {driver_payout} added to earnings.",
            pickup=pickup
        )

    # 4. Finalize
    pickup.status = 'verified'
    pickup.save()

    RecyclingLog.objects.create(
        user=pickup.user, 
        points_awarded=earned_points, 
        waste_type=pickup.waste_type, 
        quantity=f"{pickup.actual_quantity} kg", 
        description="Completed & Verified"
    )
    
    return Response({
        "message": "Verified", 
        "driver_payout": float(driver_payout),
        "user_points_awarded": earned_points
    })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_pickup_request(request, request_id):
    pickup = get_object_or_404(PickupRequest, id=request_id)
    pickup.status = 'cancelled'
    pickup.rejection_reason = request.data.get('reason', 'No reason provided')
    pickup.save()
    
    Notification.objects.create(
        user=pickup.user,
        message=f"Your pickup request was rejected: {pickup.rejection_reason}",
        pickup=pickup
    )
    return Response({"message": "Rejected"})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_users(request):
    users = User.objects.filter(role='resident')
    return Response(UserSerializer(users, many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_user_status(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if user == request.user:
        return Response({"error": "Cannot disable your own account"}, status=400)
    user.is_active = not user.is_active
    user.save()
    return Response({"message": "Status updated"})

# --- UPDATED: GET ALL COLLECTORS (With Real-Time Stats) ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_collectors(request):
    collectors = User.objects.filter(role='service_provider', is_active=True)
    response_data = []
    
    for driver in collectors:
        # Get base user data
        driver_data = UserSerializer(driver).data
        
        # Calculate real-time stats
        # We count any job that has passed the 'assigned' stage (collected, paid, or verified)
        job_count = PickupRequest.objects.filter(
            collector=driver,
            status__in=['collected', 'verified', 'paid']
        ).count()
        
        # Calculate total weight (sum actual_quantity)
        total_weight = PickupRequest.objects.filter(
            collector=driver,
            status__in=['collected', 'verified', 'paid']
        ).aggregate(Sum('actual_quantity'))['actual_quantity__sum'] or 0
        
        # Inject into response
        driver_data['completed_jobs_count'] = job_count
        driver_data['total_weight_kg'] = total_weight
        
        response_data.append(driver_data)
        
    return Response(response_data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_collector(request):
    d = request.data
    try:
        user = User.objects.create_user(
            username=d['email'], email=d['email'], 
            password=d['password'], first_name=d.get('first_name'), 
            last_name=d.get('last_name'), phone=d.get('phone'), role='service_provider'
        )
        return Response(UserSerializer(user).data, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_collector(request, collector_id):
    get_object_or_404(User, id=collector_id, role='service_provider').delete()
    return Response({"message": "Deleted"})

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def verify_driver(request, driver_id):
    driver = get_object_or_404(User, id=driver_id, role='service_provider')
    if hasattr(driver, 'driver_profile'):
        profile = driver.driver_profile
        profile.is_verified = True
        profile.save()
        return Response({"message": f"Driver {driver.get_full_name()} verified successfully!"})
    else:
        return Response({"error": "Driver profile not found"}, status=404)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_history(request):
    history = PickupRequest.objects.filter(status__in=['paid', 'verified', 'cancelled']).order_by('-created_at')
    return Response(PickupRequestSerializer(history, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_collector_history(request):
    if request.user.role != 'service_provider':
        return Response({"error": "Unauthorized"}, status=403)
    history = PickupRequest.objects.filter(collector=request.user, status__in=['paid', 'verified']).order_by('-scheduled_date')
    return Response(PickupRequestSerializer(history, many=True).data)

# --- 6. PAYMENTS & REWARDS (NEW LOGIC) ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    # This handles the USER PAYING THE BILL (Bill -> System)
    pickup = get_object_or_404(PickupRequest, id=request.data.get('pickup_id'), user=request.user)
    
    if pickup.billed_amount <= 0:
        return Response({"error": "Driver has not verified the weight yet."}, status=400)

    if pickup.is_paid:
        return Response({"error": "This bill is already paid."}, status=400)

    amount_to_pay = float(pickup.billed_amount)
    # Mocking M-Pesa Transaction
    trans_code = f"MPESA-{uuid.uuid4().hex[:8].upper()}"
    
    pickup.is_paid = True
    pickup.save()

    return Response({"message": "Payment Successful", "status": "completed", "amount": amount_to_pay, "code": trans_code})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def redeem_points(request):
    # NEW: Converts Points -> Cash in Wallet
    user = request.user
    
    if user.redeemable_points < 1000:
        return Response({"error": f"Insufficient points. You need 1000, you have {user.redeemable_points}"}, status=400)
    
    # 1. Deduct Points
    user.redeemable_points = F('redeemable_points') - 1000
    user.save()
    
    # 2. Add Cash to Wallet
    reward_amount = Decimal("300.00")
    wallet, _ = Wallet.objects.get_or_create(user=user)
    wallet.balance = F('balance') + reward_amount
    wallet.save()
    
    # 3. Log Transaction
    WalletTransaction.objects.create(
        wallet=wallet,
        transaction_type='redemption',
        amount=reward_amount,
        status='completed',
        description="Redeemed 1000 points for KES 300"
    )
    
    # Refresh to get new values
    user.refresh_from_db()
    wallet.refresh_from_db()
    
    return Response({
        "message": "Redemption Successful!",
        "new_points_balance": user.redeemable_points,
        "wallet_balance": wallet.balance
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def withdraw_cash(request):
    # NEW: Withdraws Wallet Cash -> M-Pesa
    user = request.user
    amount = Decimal(request.data.get('amount', 0))
    phone = request.data.get('phone', user.phone)
    
    if amount < 100:
        return Response({"error": "Minimum withdrawal is KES 100"}, status=400)
        
    wallet, _ = Wallet.objects.get_or_create(user=user)
    
    if wallet.balance < amount:
        return Response({"error": "Insufficient wallet balance"}, status=400)
        
    # 1. Deduct from Wallet
    wallet.balance = F('balance') - amount
    wallet.save()
    
    # 2. Log Transaction
    WalletTransaction.objects.create(
        wallet=wallet,
        transaction_type='withdrawal',
        amount=amount,
        status='completed', # In real app, this would be 'pending' until M-Pesa callback
        description=f"Withdrawal to {phone}"
    )
    
    return Response({"message": f"Withdrawal of KES {amount} sent to {phone}."})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_driver_wallet(request):
    if request.user.role != 'service_provider':
        return Response({"error": "Unauthorized"}, status=403)
    
    # 1. Get Completed Jobs (For History Table)
    completed_jobs = PickupRequest.objects.filter(
        collector=request.user,
        status__in=['verified', 'paid'] 
    ).order_by('-scheduled_date')

    # 2. Get Pending Jobs (For Orange Pending Box)
    pending_jobs = PickupRequest.objects.filter(
        collector=request.user,
        status='collected',
        is_paid=False 
    )

    # 3. Calculate Pending Amount Live
    pending_amount = 0.0
    for job in pending_jobs:
        # Base fee (100) + 20% commission
        commission = float(job.billed_amount) * 0.20 if job.billed_amount else 0.0
        pending_amount += 100.0 + commission

    # 4. Get Stored Total from Profile
    try:
        profile = request.user.driver_profile
        stored_total = float(profile.total_earned)
    except:
        # Create profile if missing
        profile = DriverProfile.objects.create(user=request.user)
        stored_total = 0.0

    # 5. Create Transaction List
    transactions = PickupRequestSerializer(completed_jobs, many=True).data

    # --- THE SAFETY NET ---
    # If Stored Total > History, add "Previous Earnings" row to fix empty table
    calculated_from_history = sum([100 + (float(j.billed_amount) * 0.2) for j in completed_jobs])
    
    if stored_total > calculated_from_history:
        diff = stored_total - calculated_from_history
        # Avoid tiny floating point diffs
        if diff > 1.0: 
            transactions.insert(0, {
                "id": "MIGRATE",
                "waste_type": "Previous Earnings",
                "region": "System Migration",
                "scheduled_date": timezone.now(),
                "billed_amount": (diff - 100) / 0.2, # Rough estimate for display
                "status": "verified",
                "user_full_name": "System"
            })

    return Response({
        "total_earned": round(stored_total, 2),
        "pending_amount": round(pending_amount, 2),
        "currency": "KES",
        "transactions": transactions
    })

# --- 7. NOTIFICATIONS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifs = Notification.objects.filter(user=request.user).order_by('-created_at')
    return Response(NotificationSerializer(notifs, many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"message": "All marked as read"})