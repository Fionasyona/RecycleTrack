from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, PickupRequestSerializer, PaymentSerializer
from .models import RecyclingLog, PickupRequest, Payment
import uuid
import random 

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Random Nairobi Coordinates fallback for profile
        user.latitude = -1.2921 + random.uniform(-0.05, 0.05)
        user.longitude = 36.8219 + random.uniform(-0.05, 0.05)
        user.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    if request.method == 'GET': return Response(UserSerializer(request.user).data)
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def award_points(request):
    email = request.data.get('email')
    waste_type = request.data.get('waste_type', 'Plastic')
    if not email: return Response({"error": "Email required"}, status=400)
    user = get_object_or_404(User, email=email)
    points = {'Plastic': 20, 'Glass': 15, 'Paper': 10, 'Metal': 30, 'Electronics': 50}.get(waste_type, 20)
    user.points += points
    user.update_badge()
    RecyclingLog.objects.create(user=user, points_awarded=points, waste_type=waste_type, quantity="1 bag", description=f"Recycled {waste_type}")
    return Response({"message": "Points awarded", "new_total": user.points})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard(request):
    leaders = User.objects.filter(role='resident', is_staff=False).order_by('-points')[:20]
    return Response(UserSerializer(leaders, many=True).data)

# --- CREATE PICKUP (Serializer handles lat/long/address now) ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_pickup_request(request):
    serializer = PickupRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_pending_requests(request):
    requests = PickupRequest.objects.exclude(status__in=['verified', 'cancelled']).order_by('scheduled_date')
    return Response(PickupRequestSerializer(requests, many=True).data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def verify_pickup_request(request, request_id):
    pickup = get_object_or_404(PickupRequest, id=request_id)
    if pickup.status == 'verified': return Response({"error": "Already verified"}, status=400)
    user = pickup.user
    points = {'Plastic': 20, 'Glass': 15, 'Paper': 10, 'Metal': 30, 'Electronics': 50}.get(pickup.waste_type, 20)
    user.points += points
    user.update_badge()
    pickup.status = 'verified'
    pickup.save()
    RecyclingLog.objects.create(user=user, points_awarded=points, waste_type=pickup.waste_type, quantity=pickup.quantity, description="Pickup Verified")
    return Response({"message": "Verified"})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def reject_pickup_request(request, request_id):
    pickup = get_object_or_404(PickupRequest, id=request_id)
    if pickup.status == 'verified': return Response({"error": "Cannot reject verified"}, status=400)
    pickup.status = 'cancelled'
    pickup.rejection_reason = request.data.get('reason', 'No reason provided')
    pickup.save()
    return Response({"message": "Rejected"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_history(request):
    pending = PickupRequest.objects.filter(user=request.user, status__in=['pending', 'assigned', 'collected', 'cancelled']).order_by('-created_at')
    logs = RecyclingLog.objects.filter(user=request.user).order_by('-date')
    history_data = [{'id': l.id, 'type': 'completed', 'date': l.date, 'waste_type': l.waste_type, 'quantity': l.quantity, 'points': l.points_awarded, 'status': 'Verified'} for l in logs]
    return Response({"pending": PickupRequestSerializer(pending, many=True).data, "history": history_data})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_users(request):
    return Response(UserSerializer(User.objects.filter(role='resident'), many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_user_status(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if user == request.user: return Response({"error": "Cannot ban self"}, status=400)
    user.is_active = not user.is_active
    user.save()
    return Response({"message": "Status updated"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    if not user.check_password(request.data.get('old_password')): return Response({"error": "Incorrect password"}, status=400)
    user.set_password(request.data.get('new_password'))
    user.save()
    return Response({"message": "Password changed"})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_collectors(request):
    return Response(UserSerializer(User.objects.filter(role='service_provider', is_active=True), many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def assign_collector(request, request_id):
    pickup = get_object_or_404(PickupRequest, id=request_id)
    collector = get_object_or_404(User, id=request.data.get('collector_id'), role='service_provider')
    pickup.collector = collector
    pickup.status = 'assigned'
    pickup.assigned_at = timezone.now()
    pickup.save()
    return Response({"message": f"Assigned to {collector.get_full_name()}"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_collector_jobs(request):
    if request.user.role != 'service_provider': return Response({"error": "Unauthorized"}, status=403)
    return Response(PickupRequestSerializer(PickupRequest.objects.filter(collector=request.user, status__in=['assigned', 'collected']).order_by('-scheduled_date'), many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def confirm_collection_job(request, request_id):
    job = get_object_or_404(PickupRequest, id=request_id, collector=request.user)
    job.status = 'collected'
    job.save()
    return Response({"message": "Confirmed"})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_collector(request):
    d = request.data
    try:
        user = User.objects.create_user(username=d['email'], email=d['email'], password=d['password'], first_name=d.get('first_name'), last_name=d.get('last_name'), phone=d.get('phone'), role='service_provider')
        return Response(UserSerializer(user).data, status=201)
    except Exception as e: return Response({"error": str(e)}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_collector(request, collector_id):
    get_object_or_404(User, id=collector_id, role='service_provider').delete()
    return Response({"message": "Deleted"})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_admin_history(request):
    return Response(PickupRequestSerializer(PickupRequest.objects.filter(status__in=['verified', 'cancelled']).order_by('-created_at'), many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_collector_history(request):
    if request.user.role != 'service_provider': return Response({"error": "Unauthorized"}, status=403)
    return Response(PickupRequestSerializer(PickupRequest.objects.filter(collector=request.user, status='verified').order_by('-scheduled_date'), many=True).data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_my_account(request):
    request.user.delete()
    return Response({"message": "Account deleted"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    pickup = get_object_or_404(PickupRequest, id=request.data.get('pickup_id'), user=request.user)
    trans_code = f"MPESA-{uuid.uuid4().hex[:8].upper()}"
    Payment.objects.create(user=request.user, pickup_request=pickup, transaction_code=trans_code, amount=request.data.get('amount', 100), phone_number=request.data.get('phone', request.user.phone), status='completed')
    return Response({"message": "Payment Successful", "status": "completed"})