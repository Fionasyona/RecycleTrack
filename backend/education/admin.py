from django.contrib import admin
from .models import Article, Category

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