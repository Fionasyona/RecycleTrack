from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q

# Import models
from .models import RecyclingCenter, CenterService, UserActivityLocation, CenterReview
from .serializers import (
    RecyclingCenterSerializer, RecyclingCenterCreateSerializer,
    UserActivityLocationSerializer, CenterReviewSerializer
)

class RecyclingCenterViewSet(viewsets.ModelViewSet):
    """
    Handles:
    - GET /api/map/centers/ (List with filters)
    - POST /api/map/centers/ (Create new center)
    - GET /api/map/centers/nearby/ (Custom nearby search)
    """
    queryset = RecyclingCenter.objects.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RecyclingCenterCreateSerializer
        return RecyclingCenterSerializer

    def get_permissions(self):
        # Allow anyone to read/search, but only logged-in users to create/edit
        if self.action in ['list', 'retrieve', 'nearby', 'services']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """
        Custom filtering logic for GET /centers/
        """
        queryset = super().get_queryset().prefetch_related('services')
        
        # Filter by type
        center_type = self.request.query_params.get('type')
        if center_type:
            queryset = queryset.filter(type=center_type)
        
        # Filter by service
        service = self.request.query_params.get('service')
        if service:
            queryset = queryset.filter(services__service_name__icontains=service).distinct()
        
        # Search by name or address
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(address__icontains=search)
            )
            
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        # Add user location to context if provided (for distance calc)
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        if lat and lng:
            context['user_location'] = {'lat': lat, 'lng': lng}
        return context

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """
        Custom action: GET /api/map/centers/nearby/?lat=...&lng=...
        """
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        radius = int(request.query_params.get('radius', 5000))

        if not lat or not lng:
            return Response({'error': 'Latitude and longitude required'}, status=400)

        # Get all centers and calculate distance in Python (simple approach)
        centers = self.get_queryset()
        nearby_centers = []
        
        for center in centers:
            distance = center.calculate_distance(lat, lng)
            if distance <= radius:
                nearby_centers.append({'center': center, 'distance': distance})
        
        # Sort by distance
        nearby_centers.sort(key=lambda x: x['distance'])
        
        # Serialize
        context = {'user_location': {'lat': lat, 'lng': lng}}
        data = [
            RecyclingCenterSerializer(item['center'], context=context).data 
            for item in nearby_centers
        ]
        return Response(data)

    @action(detail=False, methods=['get'])
    def services(self, request):
        """
        Custom action: GET /api/map/centers/services/
        """
        services = CenterService.objects.values_list('service_name', flat=True).distinct()
        return Response({'services': list(services)})


class ReviewViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, center_pk=None):
        reviews = CenterReview.objects.filter(center_id=center_pk).order_by('-created_at')
        serializer = CenterReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def create(self, request, center_pk=None):
        user = request.user
        try:
            center = RecyclingCenter.objects.get(pk=center_pk)
        except RecyclingCenter.DoesNotExist:
            return Response({'error': 'Center not found'}, status=404)

        if CenterReview.objects.filter(center=center, user=user).exists():
            return Response({'error': 'You have already reviewed this center'}, status=400)

        data = request.data.copy()
        data['center'] = center_pk
        data['user'] = user.user_id
        
        serializer = CenterReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# ==========================================
#  Function-Based Views (The missing part)
# ==========================================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_activity_locations(request):
    """
    Get user's activity locations for map display
    GET /api/map/activities/
    """
    try:
        user = request.user
        
        # Get activities with location data
        activities = UserActivityLocation.objects.filter(user_id=user.id).order_by('-created_at')
        
        # Limit results
        limit = int(request.GET.get('limit', 50))
        activities = activities[:limit]
        
        serializer = UserActivityLocationSerializer(activities, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )