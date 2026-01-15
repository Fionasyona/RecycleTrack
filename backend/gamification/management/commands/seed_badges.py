# gamification/management/commands/seed_badges.py
# Create this file structure:
# gamification/
#   management/
#     __init__.py
#     commands/
#       __init__.py
#       seed_badges.py

from django.core.management.base import BaseCommand
from gamification.models import Badge


class Command(BaseCommand):
    help = 'Seed initial badges'

    def handle(self, *args, **kwargs):
        badges_data = [
            {
                'name': 'First Steps',
                'description': 'Complete your first recycling report',
                'badge_type': 'bronze',
                'icon': '🥉',
                'points_value': 10,
                'criteria_type': 'activities_count',
                'criteria_value': 1,
            },
            {
                'name': 'Eco Beginner',
                'description': 'Earn your first 100 points',
                'badge_type': 'bronze',
                'icon': '🌱',
                'points_value': 20,
                'criteria_type': 'total_points',
                'criteria_value': 100,
            },
            {
                'name': 'Eco Warrior',
                'description': 'Report 10 recycling activities',
                'badge_type': 'silver',
                'icon': '🥈',
                'points_value': 50,
                'criteria_type': 'activities_count',
                'criteria_value': 10,
            },
            {
                'name': 'Point Master',
                'description': 'Reach 500 points',
                'badge_type': 'silver',
                'icon': '⭐',
                'points_value': 75,
                'criteria_type': 'total_points',
                'criteria_value': 500,
            },
            {
                'name': 'Green Champion',
                'description': 'Reach 1000 points',
                'badge_type': 'gold',
                'icon': '🥇',
                'points_value': 100,
                'criteria_type': 'total_points',
                'criteria_value': 1000,
            },
            {
                'name': 'Recycling Expert',
                'description': 'Report 25 recycling activities',
                'badge_type': 'gold',
                'icon': '♻️',
                'points_value': 150,
                'criteria_type': 'activities_count',
                'criteria_value': 25,
            },
            {
                'name': 'Master Recycler',
                'description': 'Report 50 recycling activities',
                'badge_type': 'platinum',
                'icon': '🏆',
                'points_value': 250,
                'criteria_type': 'activities_count',
                'criteria_value': 50,
            },
            {
                'name': 'Point Legend',
                'description': 'Reach 2500 points',
                'badge_type': 'platinum',
                'icon': '💎',
                'points_value': 300,
                'criteria_type': 'total_points',
                'criteria_value': 2500,
            },
            {
                'name': 'Streak Master',
                'description': 'Maintain a 30-day recycling streak',
                'badge_type': 'diamond',
                'icon': '🔥',
                'points_value': 500,
                'criteria_type': 'streak',
                'criteria_value': 30,
            },
            {
                'name': 'Ultimate Champion',
                'description': 'Reach 5000 points',
                'badge_type': 'diamond',
                'icon': '👑',
                'points_value': 1000,
                'criteria_type': 'total_points',
                'criteria_value': 5000,
            },
        ]

        for badge_data in badges_data:
            badge, created = Badge.objects.get_or_create(
                name=badge_data['name'],
                defaults=badge_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created badge: {badge.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Badge already exists: {badge.name}'))

        self.stdout.write(self.style.SUCCESS('✅ Badge seeding complete!'))