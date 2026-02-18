import re
from django.db import models
from django.conf import settings 

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
    
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_articles', blank=True)

    class Meta:
        ordering = ['-published_date']

    def __str__(self):
        return self.title

    @property
    def total_likes(self):
        return self.likes.count()

class Video(models.Model):
    title = models.CharField(max_length=200)
    
    # Increased max_length to 200 to allow pasting full URLs before cleaning
    youtube_id = models.CharField(
        max_length=200, 
        help_text="Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
    )
    
    channel = models.CharField(max_length=100, help_text="Name of the YouTube channel")
    duration = models.CharField(max_length=10, help_text="Format: MM:SS (e.g., 10:15)")
    
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='videos')
    published_date = models.DateField(auto_now_add=True)
    
    views = models.PositiveIntegerField(default=0)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_videos', blank=True)

    class Meta:
        ordering = ['-published_date']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """
        Intercepts the save process to extract the 11-character YouTube ID
        if a full URL was pasted.
        """
        if self.youtube_id:
            # Regex to find the 11-char ID after 'v=' (desktop) or last slash (mobile/share)
            regex = r'(?:v=|\/)([0-9A-Za-z_-]{11}).*'
            match = re.search(regex, self.youtube_id)
            
            if match:
                self.youtube_id = match.group(1)
                
        super(Video, self).save(*args, **kwargs)

    @property
    def thumbnail(self):
        """
        Returns the standard high-quality thumbnail from YouTube servers.
        mqdefault is used as a fallback if maxres doesn't exist, but usually maxres is better.
        """
        return f"https://img.youtube.com/vi/{self.youtube_id}/mqdefault.jpg"