from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import PickupRequest, DriverProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Fix bad job data and sync wallet'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Driver Email')

    def handle(self, *args, **kwargs):
        email = kwargs['email']
        try:
            driver = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {email} not found'))
            return

        self.stdout.write(f"Fixing data for: {driver.get_full_name()}")

        # 1. FIX BAD JOBS (Weight 0.0)
        bad_jobs = PickupRequest.objects.filter(collector=driver, actual_quantity=0.0, status__in=['paid', 'verified', 'collected'])
        count = bad_jobs.count()
        
        if count > 0:
            self.stdout.write(self.style.WARNING(f"Found {count} jobs with 0.0 kg. Fixing..."))
            for job in bad_jobs:
                job.actual_quantity = 5.0  # Default to 5kg
                job.billed_amount = 250.0  # 5kg * 50
                job.save()
            self.stdout.write(self.style.SUCCESS("Bad jobs fixed."))
        else:
            self.stdout.write("No bad jobs found.")

        # 2. RECALCULATE WALLET
        # We recalculate strictly based on the jobs that exist now
        jobs = PickupRequest.objects.filter(collector=driver)
        real_total = 0.0
        
        for job in jobs:
            # Check if this job counts as "Earnings"
            # Logic: Verified OR (Collected & Paid) OR Paid
            if job.status == 'verified' or (job.status == 'collected' and job.is_paid) or job.status == 'paid':
                bill = float(job.billed_amount)
                # Formula: Base 100 + 20% Commission
                pay = 100.0 + (bill * 0.20)
                real_total += pay

        # 3. UPDATE DB
        profile, _ = DriverProfile.objects.get_or_create(user=driver)
        profile.total_earned = real_total
        profile.save()

        self.stdout.write(self.style.SUCCESS(f"--------------------------------"))
        self.stdout.write(self.style.SUCCESS(f" WALLET SYNCED: KES {real_total}"))
        self.stdout.write(self.style.SUCCESS(f"--------------------------------"))