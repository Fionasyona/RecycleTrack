# backend/map/management/commands/seed_map_data.py
from django.core.management.base import BaseCommand
from map.models import RecyclingCenter, CenterService
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seed initial recycling centers data'

    def handle(self, *args, **kwargs):
        centers_data = [
            {
                'name': 'EcoWaste Recycling Center',
                'type': 'recycling_center',
                'address': 'Industrial Area, Nairobi',
                'latitude': Decimal('-1.3207'),
                'longitude': Decimal('36.8647'),
                'phone': '0700123456',
                'email': 'info@ecowaste.co.ke',
                'open_hours': 'Mon-Sat: 8AM-6PM',
                'rating': Decimal('4.5'),
                'services': ['Plastic', 'E-waste', 'Paper']
            },
            {
                'name': 'GreenCycle Collection Point',
                'type': 'collection_point',
                'address': 'Kilimani, Nairobi',
                'latitude': Decimal('-1.2921'),
                'longitude': Decimal('36.7809'),
                'phone': '0711234567',
                'email': 'contact@greencycle.co.ke',
                'open_hours': 'Mon-Fri: 9AM-5PM',
                'rating': Decimal('4.2'),
                'services': ['Plastic', 'Paper', 'Glass']
            },
            {
                'name': 'Kasarani Waste Management',
                'type': 'recycling_center',
                'address': 'Kasarani, Nairobi',
                'latitude': Decimal('-1.2195'),
                'longitude': Decimal('36.8987'),
                'phone': '0722345678',
                'email': 'info@kasaraniwaste.co.ke',
                'open_hours': 'Mon-Sat: 7AM-7PM',
                'rating': Decimal('4.7'),
                'services': ['Organic', 'E-waste', 'Plastic']
            },
            {
                'name': 'Westlands Eco Station',
                'type': 'collection_point',
                'address': 'Westlands, Nairobi',
                'latitude': Decimal('-1.2676'),
                'longitude': Decimal('36.8078'),
                'phone': '0733456789',
                'email': 'hello@westlandseco.co.ke',
                'open_hours': 'Daily: 8AM-8PM',
                'rating': Decimal('4.0'),
                'services': ['Paper', 'Plastic', 'Metal']
            },
            {
                'name': 'Embakasi E-Waste Center',
                'type': 'recycling_center',
                'address': 'Embakasi, Nairobi',
                'latitude': Decimal('-1.3138'),
                'longitude': Decimal('36.8919'),
                'phone': '0744567890',
                'email': 'support@embakasiewaste.co.ke',
                'open_hours': 'Mon-Fri: 8AM-5PM',
                'rating': Decimal('4.6'),
                'services': ['E-waste', 'Batteries', 'Electronics']
            },
        ]

        for center_data in centers_data:
            services = center_data.pop('services')
            
            # Create or get center
            center, created = RecyclingCenter.objects.get_or_create(
                name=center_data['name'],
                defaults=center_data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created center: {center.name}')
                )
                
                # Add services
                for service_name in services:
                    CenterService.objects.create(
                        center=center,
                        service_name=service_name
                    )
                    self.stdout.write(f'   → Added service: {service_name}')
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️  Center already exists: {center.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 Successfully seeded {len(centers_data)} recycling centers!')
        )