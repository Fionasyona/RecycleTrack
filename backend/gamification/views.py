from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum
from datetime import datetime, timedelta
from django.utils import timezone

# Import models specific to Gamification
from .models import UserPoints, Activity, Leaderboard, Achievement

# Import Badge models from the Badges app (if needed for stats)
try:
    from badges.models import UserBadge, Badge
except ImportError:
    UserBadge = None
    Badge = None

# Import map model safely
try:
    from map.models import UserActivityLocation
except ImportError:
    UserActivityLocation = None

from .serializers import (
    UserPointsSerializer, ActivitySerializer, 
    LeaderboardSerializer, AchievementSerializer
)

# --- USER STATS & POINTS ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_stats(request):
    """Get user's gamification statistics"""
    user = request.user
    
    # Handle new users safely
    user_points, created = UserPoints.objects.get_or_create(
        user_id=user.id,
        defaults={
            'total_points': 0,
            'current_level': 1,
            'weekly_points': 0,
            'monthly_points': 0,
            'streak_days': 0
        }
    )
    
    # Get badge count safely
    badges_count = 0
    if UserBadge:
        badges_count = UserBadge.objects.filter(user_id=user.id).count()

    activities_count = Activity.objects.filter(user_id=user.id).count()
    
    # Calculate Rank
    higher_ranked = UserPoints.objects.filter(total_points__gt=user_points.total_points).count()
    rank = higher_ranked + 1
    
    stats = {
        'points': user_points.total_points,
        'level': user_points.current_level,
        'badges': badges_count,
        'activities': activities_count,
        'rank': rank,
        'weekly_points': user_points.weekly_points,
        'monthly_points': user_points.monthly_points,
        'streak_days': user_points.streak_days,
        'next_level_points': (user_points.current_level * 1000) - user_points.total_points,
    }
    
    return Response(stats, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_points(request):
    """Get user's points details"""
    user = request.user
    user_points, created = UserPoints.objects.get_or_create(user_id=user.id)
    serializer = UserPointsSerializer(user_points)
    return Response(serializer.data, status=status.HTTP_200_OK)


# --- LEADERBOARD ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard(request):
    """Get leaderboard rankings"""
    limit = int(request.GET.get('limit', 10))
    period = request.GET.get('period', 'all_time')
    
    if period == 'weekly':
        leaderboard = UserPoints.objects.all().order_by('-weekly_points')[:limit]
        points_field = 'weekly_points'
    elif period == 'monthly':
        leaderboard = UserPoints.objects.all().order_by('-monthly_points')[:limit]
        points_field = 'monthly_points'
    else:
        leaderboard = UserPoints.objects.all().order_by('-total_points')[:limit]
        points_field = 'total_points'
        
    data = []
    for idx, up in enumerate(leaderboard, 1):
        data.append({
            'rank': idx,
            'user_id': up.user.user_id if hasattr(up.user, 'user_id') else up.user.id,
            'full_name': getattr(up.user, 'full_name', str(up.user)),
            'points': getattr(up, points_field),
            'level': up.current_level,
            'trend': 0
        })
    
    return Response(data, status=status.HTTP_200_OK)


# --- ACTIVITIES ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_activities(request):
    """Get user's recent activities"""
    user = request.user
    limit = int(request.GET.get('limit', 10))
    activities = Activity.objects.filter(user_id=user.id).order_by('-created_at')[:limit]
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_activity(request):
    """Report a new recycling activity and save location if provided"""
    user = request.user
    data = request.data.copy()
    data['user'] = user.id
    
    serializer = ActivitySerializer(data=data)
    
    if serializer.is_valid():
        # 1. Save the Gamification Activity first
        activity = serializer.save()
        
        # 2. Extract Location Data from the request
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        
        # 3. Create Map Entry (if location exists and Map app is installed)
        if latitude and longitude and UserActivityLocation:
            try:
                UserActivityLocation.objects.create(
                    user=user,
                    activity_type=activity.activity_type,
                    description=activity.description or "",
                    latitude=latitude,
                    longitude=longitude,
                    points_earned=activity.points_earned
                )
            except Exception as e:
                print(f"Error saving location: {e}")
                # Don't fail the request if just the map part fails

        return Response({
            'success': True,
            'message': 'Activity reported successfully!',
            'points_earned': activity.points_earned,
            'activity': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'message': 'Failed to report activity',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_achievements(request):
    """Get user's achievements"""
    user = request.user
    achievements = Achievement.objects.filter(user_id=user.id).order_by('-achieved_at')
    serializer = AchievementSerializer(achievements, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Activity.objects.filter(user_id=self.request.user.id)