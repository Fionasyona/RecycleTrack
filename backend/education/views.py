from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Article, Category, Video
# Ensure CategorySerializer is included in the import below
from .serializers import ArticleSerializer, VideoSerializer, CategorySerializer

# --- CUSTOM PERMISSION ---
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Check if user is admin (adjust attribute based on your User model)
        return (request.user and 
                request.user.is_authenticated and 
                getattr(request.user, 'role', '') == 'admin')

# --- NEW CATEGORY VIEWSET (Fixes the ImportError) ---
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny] # Usually public so users can filter

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'excerpt']

    def get_queryset(self):
        queryset = Article.objects.all()
        category_param = self.request.query_params.get('category', None)
        
        if category_param and category_param != "All":
            queryset = queryset.filter(category__name__iexact=category_param)
            
        return queryset.order_by('-published_date')

    def perform_create(self, serializer):
        user = self.request.user
        author_name = "RecycleTrack Admin"
        if hasattr(user, 'get_full_name') and user.get_full_name():
            author_name = user.get_full_name()
        elif hasattr(user, 'username'):
            author_name = user.username
            
        serializer.save(author=author_name)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        # Return unique category names from both Articles and Videos
        article_cats = list(Article.objects.values_list('category__name', flat=True).distinct())
        video_cats = list(Video.objects.values_list('category__name', flat=True).distinct())
        
        # Combine and remove None/Duplicates
        all_cats = set(filter(None, article_cats + video_cats))
        return Response(["All"] + list(all_cats))

# --- VIDEO VIEWSET ---
class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'channel']

    def get_queryset(self):
        queryset = Video.objects.all()
        category_param = self.request.query_params.get('category', None)
        
        if category_param and category_param != "All":
            queryset = queryset.filter(category__name__iexact=category_param)
            
        return queryset.order_by('-published_date')