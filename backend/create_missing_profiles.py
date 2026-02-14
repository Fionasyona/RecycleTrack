import mysql.connector
import random

# --- CONFIGURATION ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'recycletrack' # <--- Confirm your DB name
}

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    print("Connected! Checking for missing driver profiles...")

    # 1. Get ALL users who are 'service_provider'
    cursor.execute("SELECT id, first_name, last_name FROM users_recycleuser WHERE role = 'service_provider'")
    all_service_providers = cursor.fetchall()
    
    print(f"Found {len(all_service_providers)} Service Providers in the User table.")

    created_count = 0
    updated_count = 0

    for user in all_service_providers:
        user_id = user['id']
        
        # 2. Check if this user ALREADY has a profile
        cursor.execute("SELECT id FROM users_driverprofile WHERE user_id = %s", (user_id,))
        existing_profile = cursor.fetchone()

        # Generate Fake Kenyan Data
        kenyan_id = str(random.randint(22000000, 39000000))
        license_no = f"F{random.randint(1000000, 9999999)}"

        if existing_profile:
            # --- SCENARIO A: Profile Exists (Update it) ---
            update_sql = """
                UPDATE users_driverprofile 
                SET id_no = %s, license_no = %s, is_verified = 1
                WHERE user_id = %s
            """
            cursor.execute(update_sql, (kenyan_id, license_no, user_id))
            updated_count += 1
            # print(f"Updated existing profile for {user['first_name']}")
            
        else:
            # --- SCENARIO B: Profile Missing (Create it!) ---
            insert_sql = """
                INSERT INTO users_driverprofile 
                (user_id, id_no, license_no, is_verified, total_earned)
                VALUES (%s, %s, %s, 1, 0.00)
            """
            cursor.execute(insert_sql, (user_id, kenyan_id, license_no))
            created_count += 1
            print(f"Created NEW profile for {user['first_name']}")

    conn.commit()
    print("-" * 30)
    print(f"Summary:")
    print(f" - Updated: {updated_count} drivers")
    print(f" - Created: {created_count} missing profiles")
    print(f" - TOTAL:   {updated_count + created_count} Verified Drivers now ready.")

except mysql.connector.Error as err:
    print(f"Error: {err}")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()