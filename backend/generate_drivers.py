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

# The hash for 'testpass123'
VALID_PASSWORD_HASH = "pbkdf2_sha256$600000$3uN8MAKYtdaTyFE0mTPqnO$wj8PM43oQtd2D5h/o3yEWi4i8JF3dnP5dPBHOk388no="

# Simple Nairobi Estates
NAIROBI_LOCATIONS = [
    "Mwiki, Kasarani", "Roysambu, Thika Road", "Githurai 44", "Zimmerman",
    "Pipeline, Embakasi", "Utawala", "Donholm, Eastlands", "Buruburu Phase 5",
    "South B, Mariakani", "South C, Nairobi", "Kileleshwa", "Westlands",
    "Kangemi", "Kawangware", "Huruma", "Dandora Phase 2",
    "Kayole Junction", "Ruai", "Kahawa West", "Ngara", "Kibera", "Mathare"
]

fake = Faker('en_KE')

def generate_kenyan_phone():
    """Generates a phone number like 0722123456 or 0110123456"""
    # Safaricom/Airtel prefixes
    prefix = random.choice(['07', '01'])
    # Generate 8 random digits
    suffix = "".join([str(random.randint(0, 9)) for _ in range(8)])
    return f"{prefix}{suffix}"

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("Connected! Generating 20 Service Providers...")

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
        
        # Email: kamauotieno@gmail.com (Matching your screenshot)
        email = f"{base_name}@gmail.com"
        
        # Username: MUST MATCH EMAIL (As per your request)
        username = email 
        
        # Phone: Custom 07... or 01...
        phone = generate_kenyan_phone()

        # -- 2. Simple Address Selection --
        address = random.choice(NAIROBI_LOCATIONS)

        # -- 3. Service Provider Specifics --
        role = 'service_provider' 
        lifetime = 0      # Providers don't need points
        redeemable = 0    
        badge = "Provider" 

        # -- 4. Technical Defaults --
        is_superuser = 0
        is_staff = 0
        is_active = 1
        date_joined = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        # -- 5. Location (Nairobi) --
        latitude = -1.2921 + random.uniform(-0.05, 0.05)
        longitude = 36.8219 + random.uniform(-0.05, 0.05)

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
    print("Success! 20 Service Providers added.")
    print(f"Example User -> Username: {username} | Phone: {phone}")

except mysql.connector.Error as err:
    print(f"Error: {err}")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()