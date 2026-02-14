import mysql.connector
import random

# --- CONFIGURATION ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'recycletrack' # <--- Confirm this matches your XAMPP database name
}

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    print("Connected! Updating Driver Profiles...")

    # 1. Get all Service Providers from the main user table
    # We join with the profile table to ensure we only update existing profiles
    cursor.execute("""
        SELECT u.id, u.first_name, u.last_name 
        FROM users_recycleuser u
        JOIN users_driverprofile dp ON u.id = dp.user_id
        WHERE u.role = 'service_provider'
    """)
    
    drivers = cursor.fetchall()
    print(f"Found {len(drivers)} drivers to update.")

    # 2. SQL Command to update the profile
    # We update id_no, license_no AND set is_verified to 1
    update_sql = """
        UPDATE users_driverprofile 
        SET id_no = %s, 
            license_no = %s,
            is_verified = 1
        WHERE user_id = %s
    """

    count = 0
    for driver in drivers:
        # Generate realistic Kenyan National ID (8 digits)
        kenyan_id = str(random.randint(22000000, 39000000))
        
        # Generate realistic Driving License (Letter + 7 digits)
        # Usually format like F1234567
        license_no = f"F{random.randint(1000000, 9999999)}"

        # Run the update
        cursor.execute(update_sql, (kenyan_id, license_no, driver['id']))
        count += 1
        print(f"Updated {driver['first_name']}: ID {kenyan_id} | Verified: YES")

    conn.commit()
    print("------------------------------------------------")
    print(f"Success! {count} drivers updated.")
    print("Refresh your app dashboard to see the changes.")

except mysql.connector.Error as err:
    print(f"Error: {err}")
    print("NOTE: If it says 'Table doesn't exist', check if your table is named 'users_driverprofile' in phpMyAdmin.")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()