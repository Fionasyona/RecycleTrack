from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from .serializers import (
    UserSerializer, 
    CustomTokenObtainPairSerializer, 
    PickupRequestSerializer, 
    PaymentSerializer
)
from .models import RecyclingLog, PickupRequest, Payment, DriverProfile
import uuid
import random 

User = get_user_model()

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
        # Assign random offset to avoid stacking on map
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
    leaders = User.objects.filter(role='resident', is_staff=False).order_by('-points')[:20]
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
    return Response({"message": "Confirmed. Waiting for admin verification."})

# --- 4. PICKUP REQUESTS ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_pickup_request(request):
    serializer = PickupRequestSerializer(data=request.data)
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
    
    return Response({"message": f"Assigned to {collector.get_full_name()}"})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_verify_and_pay(request, request_id):
    pickup = get_object_or_404(PickupRequest, id=request_id)
    if pickup.status != 'collected':
        return Response({"error": "Waste must be collected first"}, status=400)

    user = pickup.user
    points = {'Plastic': 20, 'Glass': 15, 'Paper': 10, 'Metal': 30, 'Electronics': 50}.get(pickup.waste_type, 20)
    user.points += points
    user.update_badge()
    
    # Safely update driver profile if exists
    if hasattr(pickup.collector, 'driver_profile'):
        driver_profile = pickup.collector.driver_profile
        driver_profile.total_earned += 200 
        driver_profile.save()

    pickup.status = 'paid'
    pickup.save()

    RecyclingLog.objects.create(user=user, points_awarded=points, waste_type=pickup.waste_type, quantity=pickup.quantity, description="Admin Verified & Paid")
    return Response({"message": "Verification and Payment complete."})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_pickup_request(request, request_id):
    pickup = get_object_or_404(PickupRequest, id=request_id)
    pickup.status = 'cancelled'
    pickup.rejection_reason = request.data.get('reason', 'No reason provided')
    pickup.save()
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

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_collectors(request):
    collectors = User.objects.filter(role='service_provider', is_active=True)
    return Response(UserSerializer(collectors, many=True).data)

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

# --- NEW: VERIFY DRIVER (Replaces TEMP ID with Verified Status) ---
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def verify_driver(request, driver_id):
    driver = get_object_or_404(User, id=driver_id, role='service_provider')
    # Access the driver profile
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

# --- 6. PAYMENTS ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    pickup = get_object_or_404(PickupRequest, id=request.data.get('pickup_id'), user=request.user)
    trans_code = f"MPESA-{uuid.uuid4().hex[:8].upper()}"
    Payment.objects.create(user=request.user, pickup_request=pickup, transaction_code=trans_code, amount=request.data.get('amount', 100), phone_number=request.data.get('phone', request.user.phone), status='completed')
    return Response({"message": "Payment Successful", "status": "completed", "transaction_code": trans_code})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_driver_wallet(request):
    if request.user.role != 'service_provider':
        return Response({"error": "Unauthorized"}, status=403)
    
    # 1. Calculate Pending Earnings (Jobs marked 'collected' but not yet 'paid')
    # Assuming flat rate of 200 KES per job as per your admin_verify logic
    pending_jobs = PickupRequest.objects.filter(collector=request.user, status='collected')
    pending_amount = pending_jobs.count() * 200 
    
    # 2. Get Verified Earnings (Available Balance)
    profile = request.user.driver_profile
    
    # 3. Get Transaction History (Jobs marked 'paid')
    paid_jobs = PickupRequest.objects.filter(collector=request.user, status='paid').order_by('-scheduled_date')
    
    return Response({
        "total_earned": profile.total_earned, # Available Balance
        "pending_amount": pending_amount,     # Waiting for Admin
        "currency": "KES",
        "transactions": PickupRequestSerializer(paid_jobs, many=True).data
    })