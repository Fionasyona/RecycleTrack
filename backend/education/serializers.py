import math
from rest_framework import serializers
from .models import Article, Category

class ArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'category', 'category_name', 
            'author', 'reading_time', 'published_date', 
            'featured_image', 'excerpt', 'content', 'views'
        ]
        # FIX: We mark 'excerpt' and 'reading_time' as read_only so the frontend doesn't need to send them
        read_only_fields = ['id', 'published_date', 'author', 'views', 'reading_time', 'excerpt']

    def calculate_reading_time(self, content):
        if not content:
            return 1
        word_count = len(content.split())
        read_time = math.ceil(word_count / 200) 
        return read_time if read_time > 0 else 1

    def generate_excerpt(self, content):
        # Grab the first 150 characters as a summary
        if not content: 
            return ""
        return content[:150] + "..." if len(content) > 150 else content

    def create(self, validated_data):
        category_name = validated_data.pop('category', None)
        content = validated_data.get('content', '')

        # 1. Auto-Calculate Reading Time
        validated_data['reading_time'] = self.calculate_reading_time(content)

        # 2. Auto-Generate Excerpt (The Fix for your 400 Error)
        if 'excerpt' not in validated_data:
            validated_data['excerpt'] = self.generate_excerpt(content)
        
        # 3. Create Article
        article = Article.objects.create(**validated_data)
        
        # 4. Handle Category
        if category_name:
            category_obj, _ = Category.objects.get_or_create(
                name=category_name,
                defaults={'color': '#10B981'}
            )
            article.category = category_obj
            article.save()
            
        return article

    def update(self, instance, validated_data):
        category_name = validated_data.pop('category', None)
        content = validated_data.get('content', instance.content)
        
        # Update standard fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Recalculate helper fields if content changed
        if 'content' in validated_data:
            instance.reading_time = self.calculate_reading_time(content)
            # Only update excerpt if the user didn't manually provide one
            if 'excerpt' not in validated_data:
                instance.excerpt = self.generate_excerpt(content)
            
        # Update Category
        if category_name:
            category_obj, _ = Category.objects.get_or_create(
                name=category_name
            )
            instance.category = category_obj
            
        instance.save()
        return instance