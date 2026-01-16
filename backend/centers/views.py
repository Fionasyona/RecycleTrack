from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from .models import RecyclingCenter
from .serializers import RecyclingCenterSerializer

class CenterViewSet(viewsets.ModelViewSet):
    queryset = RecyclingCenter.objects.all().order_by('-created_at')
    serializer_class = RecyclingCenterSerializer
    
    # Custom Permission:
    # - Admins can Create/Update/Delete
    # - Normal users can only View (GET)
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]