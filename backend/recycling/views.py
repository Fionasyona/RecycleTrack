from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, AllowAny
from .models import WasteCategory
from .serializers import WasteCategorySerializer

class WasteCategoryViewSet(viewsets.ModelViewSet):
    queryset = WasteCategory.objects.all()
    serializer_class = WasteCategorySerializer
    
    # Only Admins can Add/Delete. Normal users can only View.
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser] # Ensures safety
        return [permission() for permission in permission_classes]