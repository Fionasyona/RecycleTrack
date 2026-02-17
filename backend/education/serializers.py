import math
from rest_framework import serializers
from .models import Article, Category, Video

class ArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'category', 'category_name', 
            'author', 'reading_time', 'published_date', 
            'excerpt', 'content', 'views' # Add 'featured_image' if you have it
        ]
        read_only_fields = ['id', 'published_date', 'author', 'views', 'reading_time', 'excerpt']

    def calculate_reading_time(self, content):
        if not content:
            return 1
        word_count = len(content.split())
        read_time = math.ceil(word_count / 200) 
        return read_time if read_time > 0 else 1

    def generate_excerpt(self, content):
        if not content: 
            return ""
        return content[:150] + "..." if len(content) > 150 else content

    def create(self, validated_data):
        category_name = validated_data.pop('category', None)
        content = validated_data.get('content', '')

        validated_data['reading_time'] = self.calculate_reading_time(content)
        
        if 'excerpt' not in validated_data:
            validated_data['excerpt'] = self.generate_excerpt(content)
        
        # Handle Category creation logic inside the view or here
        if category_name:
            category_obj, _ = Category.objects.get_or_create(name=category_name)
            validated_data['category'] = category_obj

        article = Article.objects.create(**validated_data)
        return article

# --- NEW VIDEO SERIALIZER ---
class VideoSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category = serializers.CharField(write_only=True, required=False)
    # Expose the property method as a field
    thumbnail = serializers.ReadOnlyField() 

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'channel', 'youtube_id', 
            'duration', 'category', 'category_name', 
            'thumbnail', 'published_date'
        ]
    
    def create(self, validated_data):
        category_name = validated_data.pop('category', None)
        
        if category_name:
            category_obj, _ = Category.objects.get_or_create(name=category_name)
            validated_data['category'] = category_obj
            
        return Video.objects.create(**validated_data)