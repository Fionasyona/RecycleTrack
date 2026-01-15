from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, CustomTokenObtainPairSerializer

# --- 1. THE DEBUG LOGIN VIEW (Keeps your new fix) ---
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny] # Force this to be public

    def post(self, request, *args, **kwargs):
        # Print what the Frontend sent
        print("------------------------------------------------")
        print("LOGIN ATTEMPT RECEIVED:")
        print(f"Data: {request.data}") 

        try:
            # Try to process the login
            response = super().post(request, *args, **kwargs)
            
            # If successful, print success
            print("LOGIN SUCCESS!")
            return response

        except Exception as e:
            # If it fails, print the EXACT error
            print(f"LOGIN FAILED: {e}")
            if hasattr(e, 'detail'):
                print(f"Detailed Error: {e.detail}")
            elif hasattr(e, 'args'):
                print(f"Error Args: {e.args}")
            print("------------------------------------------------")
            raise e

# --- 2. RESTORED REGISTRATION VIEW ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        if user:
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 3. RESTORED PROFILE VIEW ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)