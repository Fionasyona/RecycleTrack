import mysql.connector
import random
from datetime import datetime, timedelta

# --- CONFIGURATION ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'recycletrack'
}

REGIONS = ["Mwiki, Kasarani", "Roysambu", "Githurai 44", "Zimmerman", "Utawala", "South B"]
WASTE_TYPES = ["Plastic", "Paper", "Metal", "Organic", "Electronic"]

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor(dictionary=True)
    print("Connected! Generating 60 multi-state bookings...")

    # --- 1. DISABLE RULES (The Magic Fix) ---
    # This forces the database to accept the data even if tables are mismatched
    cursor.execute("SET FOREIGN_KEY_CHECKS=0")

    # 2. Fetch Residents
    cursor.execute("SELECT id, address, latitude, longitude FROM users_recycleuser WHERE role = 'resident'")
    residents = cursor.fetchall()

    # 3. Fetch Drivers
    cursor.execute("SELECT id FROM users_recycleuser WHERE role = 'service_provider'")
    drivers = [d['id'] for d in cursor.fetchall()]

    # 4. FETCH CENTERS
    cursor.execute("SELECT id FROM centers_recyclingcenter")
    centers = [c['id'] for c in cursor.fetchall()]

    if not centers:
        print("Warning: No centers found. Using defaults [1, 3, 4]")
        centers = [1, 3, 4] 

    sql = """
        INSERT INTO users_pickuprequest (
            status, waste_type, quantity, scheduled_date, 
            pickup_address, region, latitude, longitude, 
            user_id, collector_id, center_id, created_at, is_paid,
            actual_quantity, billed_amount, assigned_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    for res in residents:
        for state in ['pending', 'assigned', 'collected']:
            waste = random.choice(WASTE_TYPES)
            qty = random.randint(5, 50)
            created_at = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d %H:%M:%S')
            
            # Pick a valid ID from the REAL table
            center_id = random.choice(centers)

            # Defaults
            collector_id = None
            assigned_at = None
            is_paid = 0
            actual_qty = 0.00
            billed_amount = 0.00
            status = state

            if state == 'pending':
                sched_date = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')
            
            elif state == 'assigned':
                collector_id = random.choice(drivers) if drivers else None
                assigned_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                sched_date = datetime.now().strftime('%Y-%m-%d')
            
            elif state == 'collected':
                collector_id = random.choice(drivers) if drivers else None
                assigned_at = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
                sched_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
                is_paid = 1
                actual_qty = qty + random.uniform(-2, 2)
                billed_amount = actual_qty * 50

            values = (
                status, waste, qty, sched_date, 
                res['address'], random.choice(REGIONS), res['latitude'], res['longitude'],
                res['id'], collector_id, center_id, created_at, is_paid,
                actual_qty, billed_amount, assigned_at
            )
            cursor.execute(sql, values)

    # --- 5. RE-ENABLE RULES & COMMIT ---
    cursor.execute("SET FOREIGN_KEY_CHECKS=1")
    conn.commit()
    print("Success! Data generated successfully.")

except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()