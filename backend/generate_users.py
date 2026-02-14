import mysql.connector
from faker import Faker
import random
from datetime import datetime

# --- CONFIGURATION ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'recycletrack' 
}

# The hash for password: 'testpass123'
VALID_PASSWORD_HASH = "pbkdf2_sha256$600000$3uN8MAKYtdaTyFE0mTPqnO$wj8PM43oQtd2D5h/o3yEWi4i8JF3dnP5dPBHOk388no="

# Simple Nairobi Estates
NAIROBI_LOCATIONS = [
    "Mwiki, Kasarani", "Roysambu, Thika Road", "Githurai 44", "Zimmerman",
    "Pipeline, Embakasi", "Utawala", "Donholm, Eastlands", "Buruburu Phase 5",
    "South B, Mariakani", "South C, Nairobi", "Kileleshwa", "Westlands",
    "Kangemi", "Kawangware", "Huruma", "Dandora Phase 2",
    "Kayole Junction", "Ruai", "Kahawa West", "Ngara", "Kibera", "Mathare"
]

# Initialize Faker with Kenyan Locale
fake = Faker('en_KE')

def generate_kenyan_phone():
    """Generates a phone number like 0722123456 or 0110123456"""
    prefix = random.choice(['07', '01'])
    suffix = "".join([str(random.randint(0, 9)) for _ in range(8)])
    return f"{prefix}{suffix}"

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("Connected! Generating 20 Residents (Users)...")

    sql = """
        INSERT INTO users_recycleuser (
            password, is_superuser, username, first_name, last_name, 
            email, is_staff, is_active, date_joined, phone, address, 
            lifetime_points, role, badge, latitude, longitude, redeemable_points
        ) VALUES (
            %s, %s, %s, %s, %s, 
            %s, %s, %s, %s, %s, %s, 
            %s, %s, %s, %s, %s, %s
        )
    """

    for _ in range(20):
        # -- 1. Kenyan Identity --
        first_name = fake.first_name()
        last_name = fake.last_name()
        
        # Format: firstnamelastname (lowercase)
        base_name = f"{first_name.lower()}{last_name.lower()}"
        
        # Email: wanjikukamau@gmail.com
        email = f"{base_name}@gmail.com"
        
        # Username: Matches email (as per your request)
        username = email 
        
        # Phone: 07... or 01...
        phone = generate_kenyan_phone()

        # -- 2. Address & Location --
        address = random.choice(NAIROBI_LOCATIONS)
        
        # Nairobi Coordinates with slight random variation
        latitude = -1.2921 + random.uniform(-0.05, 0.05)
        longitude = 36.8219 + random.uniform(-0.05, 0.05)

        # -- 3. Gamification (Points 0 - 3500) --
        lifetime = random.randint(0, 3500)
        
        # Redeemable cannot be higher than lifetime
        redeemable = random.randint(0, lifetime)

        # Assign Badge
        if lifetime >= 2500:
            badge = "Platinum"
        elif lifetime >= 1500:
            badge = "Gold"
        elif lifetime >= 500:
            badge = "Silver"
        else:
            badge = "Bronze"

        # -- 4. Role & Technical Defaults --
        role = 'resident'  # Regular User
        is_superuser = 0
        is_staff = 0
        is_active = 1
        date_joined = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        values = (
            VALID_PASSWORD_HASH, 
            is_superuser, 
            username, 
            first_name, 
            last_name, 
            email, 
            is_staff, 
            is_active, 
            date_joined, 
            phone, 
            address, 
            lifetime, 
            role, 
            badge, 
            latitude, 
            longitude, 
            redeemable
        )
        
        cursor.execute(sql, values)

    conn.commit()
    print("Success! 20 Residents added.")
    print(f"Example: {first_name} {last_name} | Points: {lifetime} | Badge: {badge}")

except mysql.connector.Error as err:
    print(f"Error: {err}")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()