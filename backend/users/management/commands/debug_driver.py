from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import PickupRequest, DriverProfile
from django.db.models import Q

User = get_user_model()

class Command(BaseCommand):
    help = 'Debug driver wallet and jobs'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the driver to debug')

    def handle(self, *args, **kwargs):
        email = kwargs['email']
        try:
            driver = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {email} not found'))
            return

        # FIX: Used get_full_name() instead of .full_name
        self.stdout.write(self.style.SUCCESS(f'\n=== DEBUG REPORT FOR: {driver.get_full_name()} ({driver.email}) ==='))

        # 1. CHECK PROFILE
        try:
            profile = driver.driver_profile
            self.stdout.write(f' [WALLET] Stored DB Balance: KES {profile.total_earned}')
        except:
            self.stdout.write(self.style.ERROR(' [ERROR] No DriverProfile found! Creating one...'))
            DriverProfile.objects.create(user=driver)

        # 2. LIST JOBS
        jobs = PickupRequest.objects.filter(collector=driver).order_by('-id')
        self.stdout.write(f'\n [JOBS] Total Assigned: {jobs.count()}')
        
        calculated_total = 0.0
        
        self.stdout.write(f"\n {'ID':<5} {'Status':<12} {'Is Paid?':<10} {'Weight':<10} {'Bill (KES)':<12} {'Calc. Pay'}")
        self.stdout.write("-" * 75)

        for job in jobs:
            # Calculate what the pay SHOULD be
            pay = 0.0
            is_valid = False
            
            # Logic: Verified OR (Collected & Paid) OR Paid
            if job.status == 'verified' or (job.status == 'collected' and job.is_paid) or job.status == 'paid':
                is_valid = True
                bill = float(job.billed_amount)
                pay = 100.0 + (bill * 0.20)
                calculated_total += pay

            # Print Row
            status_color = self.style.SUCCESS if is_valid else self.style.WARNING
            self.stdout.write(status_color(f" {job.id:<5} {job.status:<12} {str(job.is_paid):<10} {job.actual_quantity:<10} {job.billed_amount:<12} {pay:.2f}"))

        self.stdout.write("-" * 75)
        self.stdout.write(self.style.SUCCESS(f' [MATH] REAL-TIME CALCULATED WALLET: KES {calculated_total}'))
        
        # 3. AUTO-FIX
        if calculated_total > 0 and float(profile.total_earned) == 0:
             self.stdout.write(self.style.WARNING('\n [MISMATCH DETECTED] Updating Wallet...'))
             profile.total_earned = calculated_total
             profile.save()
             self.stdout.write(self.style.SUCCESS(' [FIXED] Wallet updated successfully.'))