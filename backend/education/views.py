from rest_framework import viewsets, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from .models import Article, Category
from .serializers import ArticleSerializer

# --- CUSTOM PERMISSION ---
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow Admins to edit/delete objects.
    Residents (and unauthenticated users if you allow them) can only Read.
    """
    def has_permission(self, request, view):
        # 1. Allow Safe Methods (GET, HEAD, OPTIONS) for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 2. Write permissions are only allowed to the Admin
        # We check if the user is authenticated AND has the role 'admin'
        return (request.user and 
                request.user.is_authenticated and 
                getattr(request.user, 'role', '') == 'admin')

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    
    # Apply the custom permission here
    permission_classes = [IsAdminOrReadOnly]
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'excerpt', 'tags']

    def get_queryset(self):
        queryset = Article.objects.all()
        category_param = self.request.query_params.get('category', None)
        
        if category_param and category_param != "All":
            queryset = queryset.filter(category__name__iexact=category_param)
            
        return queryset.order_by('-published_date')

    def perform_create(self, serializer):
        # Automatically set the author to "Admin" or the user's name if not provided
        author_name = self.request.user.full_name if self.request.user.full_name else "RecycleTrack Admin"
        serializer.save(author=author_name)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    # --- Like Action (Authenticated users can like, even Residents) ---
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        article = self.get_object()
        user = request.user
        
        if article.likes.filter(id=user.id).exists():
            article.likes.remove(user)
            liked = False
        else:
            article.likes.add(user)
            liked = True
            
        return Response({
            'status': 'success',
            'likes': article.total_likes,
            'is_liked': liked
        })

    # --- Categories Helper ---
    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = Category.objects.values_list('name', flat=True)
        return Response(list(categories))