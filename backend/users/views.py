from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, PickupRequestSerializer
from .models import RecyclingLog, PickupRequest
from django.db.models import Q 

User = get_user_model()

# --- 1. LOGIN VIEW ---
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except Exception as e:
            raise e

# --- 2. REGISTRATION VIEW ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        if user:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 3. PROFILE VIEW ---
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 4. AWARD POINTS VIEW (Manual Verification) ---
@api_view(['POST'])
@permission_classes([IsAdminUser])
def award_points(request):
    email = request.data.get('email')
    waste_type = request.data.get('waste_type', 'Plastic') 
    quantity = request.data.get('quantity', '1 bag')

    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    user = get_object_or_404(User, email=email)
    
    POINTS_MAP = {
        'Plastic': 20, 'Glass': 15, 'Paper': 10, 'Metal': 30, 'Electronics': 50
    }
    points_to_add = POINTS_MAP.get(waste_type, 20)
    
    user.points += points_to_add
    user.update_badge() 
    
    RecyclingLog.objects.create(
        user=user,
        points_awarded=points_to_add,
        waste_type=waste_type,
        quantity=quantity,
        description=f"Recycled {quantity} of {waste_type}"
    )
    
    return Response({
        "message": f"Verified {waste_type}! Added {points_to_add} pts to {user.full_name}",
        "new_total": user.points,
        "new_badge": user.badge
    })

# --- 5. LEADERBOARD VIEW ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard(request):
    # Only show residents on leaderboard (No drivers, no admins)
    leaders = User.objects.filter(
        role='resident', 
        is_staff=False
    ).order_by('-points')[:20]
    
    serializer = UserSerializer(leaders, many=True)
    return Response(serializer.data)

# --- 6. USER: BOOK A PICKUP ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_pickup_request(request):
    print("--- DEBUG: RECEIVING PICKUP REQUEST ---")
    print(f"User: {request.user.email}")
    print(f"Data: {request.data}")

    serializer = PickupRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        print("--- DEBUG: PICKUP SAVED SUCCESSFULLY ---")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    print(f"--- DEBUG: VALIDATION ERRORS: {serializer.errors} ---")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 7. ADMIN: GET ALL ACTIVE REQUESTS ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_pending_requests(request):
    # Exclude 'verified' and 'cancelled'
    requests = PickupRequest.objects.exclude(
        status__in=['verified', 'cancelled']
    ).order_by('scheduled_date')
    
    print(f"--- DEBUG: ADMIN FETCHING ACTIVE PIPELINE. FOUND: {requests.count()} ---")
    
    serializer = PickupRequestSerializer(requests, many=True)
    return Response(serializer.data)

# --- 8. ADMIN: VERIFY PICKUP REQUEST ---
@api_view(['POST'])
@permission_classes([IsAdminUser])
def verify_pickup_request(request, request_id):
    print(f"--- DEBUG: VERIFYING REQUEST ID {request_id} ---")
    pickup_request = get_object_or_404(PickupRequest, id=request_id)
    
    if pickup_request.status == 'verified':
        return Response({"error": "Already verified"}, status=status.HTTP_400_BAD_REQUEST)

    user = pickup_request.user
    
    POINTS_MAP = {'Plastic': 20, 'Glass': 15, 'Paper': 10, 'Metal': 30, 'Electronics': 50}
    points_to_add = POINTS_MAP.get(pickup_request.waste_type, 20)

    user.points += points_to_add
    user.update_badge()
    
    pickup_request.status = 'verified'
    pickup_request.save()

    RecyclingLog.objects.create(
        user=user,
        points_awarded=points_to_add,
        waste_type=pickup_request.waste_type,
        quantity=pickup_request.quantity,
        description=f"Pickup Verified: {pickup_request.center_name}"
    )
    
    print(f"--- DEBUG: VERIFIED! AWARDED {points_to_add} POINTS ---")

    return Response({
        "message": "Pickup verified and points awarded!",
        "new_status": pickup_request.status
    })

# --- 9. ADMIN: REJECT PICKUP REQUEST ---
@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_pickup_request(request, request_id):
    pickup_request = get_object_or_404(PickupRequest, id=request_id)
    
    if pickup_request.status == 'verified':
         return Response({"error": "Cannot reject a verified request"}, status=status.HTTP_400_BAD_REQUEST)

    reason = request.data.get('reason', 'No reason provided.')

    pickup_request.status = 'cancelled'
    pickup_request.rejection_reason = reason
    pickup_request.save()

    return Response({"message": "Request rejected successfully"})

# --- 10. USER: GET MY HISTORY ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_history(request):
    requests = PickupRequest.objects.filter(
        user=request.user, 
        status__in=['pending', 'assigned', 'collected', 'cancelled']
    ).order_by('-created_at')
    
    request_serializer = PickupRequestSerializer(requests, many=True)
    
    completed_logs = RecyclingLog.objects.filter(user=request.user).order_by('-date')
    
    history_data = []
    for log in completed_logs:
        history_data.append({
            'id': log.id,
            'type': 'completed',
            'date': log.date,
            'waste_type': log.waste_type,
            'quantity': log.quantity,
            'points': log.points_awarded,
            'status': 'Verified'
        })

    return Response({
        "pending": request_serializer.data,
        "history": history_data
    })

# --- 11. ADMIN: GET ALL USERS (UPDATED) ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_users(request):
    # FIX: Strictly show 'residents'. Hides 'admin' and 'service_provider'.
    users = User.objects.filter(role='resident').order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

# --- 12. ADMIN: BAN/ACTIVATE USER ---
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_user_status(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if user == request.user:
        return Response({"error": "You cannot ban yourself."}, status=status.HTTP_400_BAD_REQUEST)

    user.is_active = not user.is_active
    user.save()
    
    status_msg = "activated" if user.is_active else "banned"
    return Response({"message": f"User {user.email} has been {status_msg}."})

# --- 13. USER: CHANGE PASSWORD ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
        return Response({"error": "Both fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(old_password):
        return Response({"error": "Incorrect old password"}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    
    return Response({"message": "Password updated successfully"})

# --- 14. ADMIN: GET ALL COLLECTORS ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_collectors(request):
    collectors = User.objects.filter(role='service_provider', is_active=True)
    serializer = UserSerializer(collectors, many=True)
    return Response(serializer.data)

# --- 15. ADMIN: ASSIGN COLLECTOR ---
@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def assign_collector(request, request_id):
    pickup = get_object_or_404(PickupRequest, id=request_id)
    collector_id = request.data.get('collector_id')
    
    collector = get_object_or_404(User, id=collector_id, role='service_provider')
    
    pickup.collector = collector
    pickup.status = 'assigned'
    pickup.save()
    
    return Response({"message": f"Assigned to {collector.full_name}"})

# --- 16. COLLECTOR: GET MY JOBS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_collector_jobs(request):
    print(f"\n--- DEBUG: COLLECTOR JOBS REQUEST ---")
    print(f"Requesting User: {request.user.email} (ID: {request.user.id})")
    print(f"Role: {request.user.role}")

    if request.user.role != 'service_provider':
        print("ERROR: User is not a service_provider")
        return Response({"error": "Unauthorized"}, status=403)
        
    # Check total jobs in system
    all_assigned = PickupRequest.objects.filter(status='assigned').count()
    print(f"Total Assigned Jobs in System (Any Driver): {all_assigned}")

    # Specific Query for THIS driver
    jobs = PickupRequest.objects.filter(
        collector=request.user,
        status__in=['assigned', 'collected']
    ).order_by('-scheduled_date')
    
    print(f"Jobs found for {request.user.email}: {jobs.count()}")
    
    serializer = PickupRequestSerializer(jobs, many=True)
    return Response(serializer.data)

# --- 17. COLLECTOR: CONFIRM PICKUP ---
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def confirm_collection_job(request, request_id):
    job = get_object_or_404(PickupRequest, id=request_id, collector=request.user)
    
    if job.status != 'assigned':
        return Response({"error": "Job not in assigned state"}, status=400)
        
    job.status = 'collected'
    job.save()
    
    return Response({"message": "Pickup confirmed! Waiting for Admin verification."})

# --- 18. ADMIN: CREATE COLLECTOR ---
@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_collector(request):
    data = request.data
    try:
        user = User.objects.create_user(
            username=data['email'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            full_name=f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
            phone=data.get('phone', ''),
            role='service_provider' 
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# --- 19. ADMIN: DELETE COLLECTOR ---
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_collector(request, collector_id):
    collector = get_object_or_404(User, id=collector_id, role='service_provider')
    collector.delete()
    return Response({"message": "Collector removed successfully"})

# --- 20. ADMIN: GET PICKUP HISTORY ---
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_history(request):
    history = PickupRequest.objects.filter(
        status__in=['verified', 'cancelled']
    ).order_by('-created_at')
    
    serializer = PickupRequestSerializer(history, many=True)
    return Response(serializer.data)

# --- 21. COLLECTOR: GET HISTORY ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_collector_history(request):
    if request.user.role != 'service_provider':
        return Response({"error": "Unauthorized"}, status=403)

    # Fetch only 'verified' (fully completed) jobs for this driver
    history = PickupRequest.objects.filter(
        collector=request.user,
        status='verified'
    ).order_by('-scheduled_date')
    
    serializer = PickupRequestSerializer(history, many=True)
    return Response(serializer.data)