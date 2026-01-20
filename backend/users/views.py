from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from .models import RecyclingLog

# Get the active User model (RecycleUser)
User = get_user_model()

# --- 1. LOGIN VIEW ---
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        print(f"LOGIN ATTEMPT: {request.data}") 
        try:
            response = super().post(request, *args, **kwargs)
            return response
        except Exception as e:
            print(f"LOGIN FAILED: {e}")
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

# --- 3. PROFILE VIEW (Updated for Edit) ---
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    
    # Handle Reading Profile
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    # Handle Updating Profile
    elif request.method == 'PATCH':
        # partial=True allows updating just a few fields (like phone) without sending everything
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 4. AWARD POINTS VIEW (Admin Only) ---
@api_view(['POST'])
@permission_classes([IsAdminUser])
def award_points(request):
    email = request.data.get('email')
    if not email:
        return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    user = get_object_or_404(User, email=email)
    
    # 1. Add Points
    POINTS_PER_RECYCLE = 20
    user.points += POINTS_PER_RECYCLE
    
    # 2. Automate Badge Update (This replaces user.save())
    # This function is defined in models.py and handles the logic
    user.update_badge() 
    
    # 3. Create Log
    RecyclingLog.objects.create(
        user=user,
        points_awarded=POINTS_PER_RECYCLE,
        description="Recycling Verified by Admin"
    )
    
    return Response({
        "message": f"Awarded {POINTS_PER_RECYCLE} points to {user.full_name}",
        "new_total": user.points,
        "new_badge": user.badge
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard(request):
    # Fetch top 20 users, sorted by points (Descending order: -points)
    # Filter out admins/staff to keep it fair for residents
    leaders = User.objects.filter(is_staff=False).order_by('-points')[:20]
    serializer = UserSerializer(leaders, many=True)
    return Response(serializer.data)