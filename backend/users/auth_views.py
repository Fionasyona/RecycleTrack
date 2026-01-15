from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from .models import RecycleUser
from .serializers import RecycleUserSerializer
import traceback


class RegisterView(APIView):
    """
    User Registration
    POST /api/auth/register/
    
    Expected payload:
    {
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "+254712345678",
        "address": "Nairobi, Kenya",
        "password": "securepassword123"
    }
    """
    def post(self, request):
        try:
            print("\n" + "="*50)
            print("📥 REGISTRATION REQUEST RECEIVED")
            print("="*50)
            print("Raw data:", request.data)
            
            # Extract data from request
            full_name = request.data.get('full_name')
            email = request.data.get('email')
            phone = request.data.get('phone')
            address = request.data.get('address')
            password = request.data.get('password')
            
            print(f"\nExtracted fields:")
            print(f"  full_name: {full_name}")
            print(f"  email: {email}")
            print(f"  phone: {phone}")
            print(f"  address: {address}")
            print(f"  password: {'***' if password else None}")
            
            # Handle frontend sending first_name and last_name separately
            if not full_name:
                first_name = request.data.get('first_name', '')
                last_name = request.data.get('last_name', '')
                full_name = f"{first_name} {last_name}".strip()
                print(f"\n✏️ Built full_name from first+last: {full_name}")
            
            # Handle frontend sending location instead of address
            if not address:
                address = request.data.get('location', '')
                print(f"✏️ Using location as address: {address}")
            
            # Validation
            if not all([full_name, email, password]):
                print(f"\n❌ VALIDATION FAILED: Missing required fields")
                return Response({
                    'message': 'Full name, email, and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if email already exists
            if RecycleUser.objects.filter(email=email).exists():
                print(f"\n❌ EMAIL ALREADY EXISTS: {email}")
                return Response({
                    'message': 'User with this email already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            print("\n✅ Validation passed, creating user...")
            
            # Create user - FIXED: use 'resident' instead of 'user'
            user = RecycleUser.objects.create(
                full_name=full_name,
                email=email,
                phone=phone or '',
                address=address or '',
                password=make_password(password),  # Hash the password
                role='resident'  # ← FIXED: Changed from 'user' to 'resident'
            )
            
            print(f"✅ User created: {user.email} (ID: {user.user_id})")
            
            # Generate JWT tokens
            print("🔑 Generating JWT tokens...")
            refresh = RefreshToken()
            refresh['user_id'] = user.user_id
            refresh['email'] = user.email
            
            print("✅ Registration successful!")
            print("="*50 + "\n")
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.user_id,
                    'user_id': user.user_id,
                    'full_name': user.full_name,
                    'first_name': user.full_name.split()[0] if user.full_name else '',
                    'last_name': ' '.join(user.full_name.split()[1:]) if len(user.full_name.split()) > 1 else '',
                    'email': user.email,
                    'phone': user.phone,
                    'address': user.address,
                    'location': user.address,  # Alias for frontend
                    'role': user.role,
                    'is_staff': user.role == 'admin',
                    'date_joined': user.created_at,
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print("\n" + "="*50)
            print("🔥 EXCEPTION CAUGHT IN REGISTRATION")
            print("="*50)
            print(f"Error Type: {type(e).__name__}")
            print(f"Error Message: {str(e)}")
            print("\nFull Traceback:")
            traceback.print_exc()
            print("="*50 + "\n")
            
            return Response({
                'message': 'Registration failed',
                'error': str(e),
                'error_type': type(e).__name__
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    """
    User Login
    POST /api/auth/login/
    
    Expected payload:
    {
        "email": "john@example.com",
        "password": "securepassword123"
    }
    """
    def post(self, request):
        try:
            email = request.data.get('email')
            password = request.data.get('password')
            
            # Validation
            if not email or not password:
                return Response({
                    'message': 'Email and password are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Find user by email
            try:
                user = RecycleUser.objects.get(email=email)
            except RecycleUser.DoesNotExist:
                return Response({
                    'message': 'Invalid email or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Check password
            if not check_password(password, user.password):
                return Response({
                    'message': 'Invalid email or password'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate JWT tokens
            refresh = RefreshToken()
            refresh['user_id'] = user.user_id
            refresh['email'] = user.email
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.user_id,
                    'user_id': user.user_id,
                    'full_name': user.full_name,
                    'first_name': user.full_name.split()[0] if user.full_name else '',
                    'last_name': ' '.join(user.full_name.split()[1:]) if len(user.full_name.split()) > 1 else '',
                    'email': user.email,
                    'phone': user.phone,
                    'address': user.address,
                    'location': user.address,  # Alias for frontend
                    'role': user.role,
                    'is_staff': user.role == 'admin',
                    'date_joined': user.created_at,
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'message': 'Login failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(APIView):
    """
    Get current user profile
    GET /api/auth/profile/
    Requires authentication header: Authorization: Bearer <token>
    """
    def get(self, request):
        # Extract user_id from JWT token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({
                'message': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # In production, you'd decode the JWT token to get user_id
        # For now, this is a placeholder
        return Response({
            'message': 'Profile endpoint working'
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    User Logout (optional - frontend can just clear tokens)
    POST /api/auth/logout/
    """
    def post(self, request):
        return Response({
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)