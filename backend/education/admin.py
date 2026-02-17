from django.contrib import admin
from .models import Article, Category, Video

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'color')

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author', 'published_date', 'views', 'total_likes')
    list_filter = ('category', 'published_date')
    search_fields = ('title', 'content')
    readonly_fields = ('views',)
    fieldsets = (
        ('Header Info', {
            'fields': ('title', 'category', 'author', 'featured_image')
        }),
        ('Content', {
            'fields': ('excerpt', 'content', 'tags', 'reading_time')
        }),
        ('Metrics', {
            'fields': ('views', 'likes')
        }),
    )

# --- NEW VIDEO ADMIN ---
@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'channel', 'category', 'duration', 'published_date', 'views')
    list_filter = ('category', 'published_date')
    search_fields = ('title', 'channel', 'youtube_id')
    readonly_fields = ('views', 'thumbnail_preview')
    
    fieldsets = (
        ('Video Details', {
            'fields': ('title', 'youtube_id', 'channel', 'duration', 'category')
        }),
        ('Metrics', {
            'fields': ('views', 'likes')
        }),
    )

    def thumbnail_preview(self, obj):
        from django.utils.html import format_html
        if obj.youtube_id:
            return format_html('<img src="{}" width="200" />', obj.thumbnail)
        return "No Thumbnail"
    
    thumbnail_preview.short_description = "Thumbnail Preview"