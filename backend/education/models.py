# education/models.py
from django.db import models
from django.conf import settings # <--- FIXED

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    color = models.CharField(max_length=20, default="#10B981") 

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Article(models.Model):
    title = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='articles')
    author = models.CharField(max_length=100, default="RecycleTrack Team")
    reading_time = models.PositiveIntegerField(help_text="Estimated reading time in minutes")
    published_date = models.DateField(auto_now_add=True)
    
    featured_image = models.ImageField(upload_to='education/images/', blank=True, null=True)
    
    excerpt = models.TextField(help_text="Short summary for the card view")
    content = models.TextField(help_text="Main content in Markdown format")
    
    tags = models.JSONField(default=list, blank=True)
    
    views = models.PositiveIntegerField(default=0)
    
    # <--- FIXED
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_articles', blank=True)

    class Meta:
        ordering = ['-published_date']

    def __str__(self):
        return self.title

    @property
    def total_likes(self):
        return self.likes.count()