# badges/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Badge, UserBadge, PointsHistory
from .serializers import BadgeSerializer, UserBadgeSerializer, PointsHistorySerializer

# --- VIEWSETS (For Admin/API Management) ---

class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]

class UserBadgeViewSet(viewsets.ModelViewSet):
    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer
    permission_classes = [IsAuthenticated]

class PointsHistoryViewSet(viewsets.ModelViewSet):
    queryset = PointsHistory.objects.all()
    serializer_class = PointsHistorySerializer
    permission_classes = [IsAuthenticated]


# --- CUSTOM ENDPOINTS ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_badges(request):
    """Get user's badges (earned and available)"""
    user = request.user
    all_badges = Badge.objects.all()
    
    user_badges = UserBadge.objects.filter(user_id=user.id)
    user_badge_ids = user_badges.values_list('badge_id', flat=True)
    
    earned_badges = []
    for ub in user_badges:
        badge_data = BadgeSerializer(ub.badge).data
        badge_data['earned'] = True
        badge_data['earned_date'] = ub.awarded_at
        earned_badges.append(badge_data)
    
    available_badges = []
    for badge in all_badges:
        if badge.badge_id not in user_badge_ids:
            badge_data = BadgeSerializer(badge).data
            badge_data['earned'] = False
            available_badges.append(badge_data)
    
    return Response({
        'earned': earned_badges,
        'available': available_badges,
        'total_earned': len(earned_badges)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_badge(request, badge_id):
    """Claim a badge"""
    user = request.user
    try:
        badge = Badge.objects.get(badge_id=badge_id)
        
        # Check if already owned
        if UserBadge.objects.filter(user_id=user.id, badge_id=badge_id).exists():
             return Response({'success': False, 'message': 'Badge already owned'}, status=status.HTTP_400_BAD_REQUEST)

        # Create the UserBadge
        UserBadge.objects.create(user_id=user.id, badge=badge)
            
        return Response({
            'success': True,
            'message': f'Badge {badge.badge_name} claimed!',
        }, status=status.HTTP_200_OK)
            
    except Badge.DoesNotExist:
        return Response({'success': False, 'message': 'Badge not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)