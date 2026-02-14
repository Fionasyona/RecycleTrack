import mysql.connector
import random

# --- CONFIGURATION ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'recycletrack'
}

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    print("Connected! Force-assigning centers to all tasks...")

    # 1. Get all valid center IDs currently in your database
    cursor.execute("SELECT id FROM centers_recyclingcenter")
    valid_ids = [row['id'] for row in cursor.fetchall()]

    if not valid_ids:
        print("Error: No centers found in 'centers_recyclingcenter'. Add centers first!")
        exit()

    print(f"Found valid center IDs: {valid_ids}")

    # 2. Get all pickup requests that need a center
    cursor.execute("SELECT id FROM users_pickuprequest")
    pickups = cursor.fetchall()

    # 3. Update each pickup individually to avoid Foreign Key errors
    update_sql = "UPDATE users_pickuprequest SET center_id = %s WHERE id = %s"
    
    count = 0
    for pickup in pickups:
        chosen_center = random.choice(valid_ids)
        cursor.execute(update_sql, (chosen_center, pickup['id']))
        count += 1

    conn.commit()
    print(f"Success! {count} tasks have been correctly linked to your {len(valid_ids)} centers.")

except mysql.connector.Error as err:
    print(f"Database Error: {err}")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()