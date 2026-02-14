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

    # Fetch Residents and Drivers
    cursor.execute("SELECT id, address, latitude, longitude FROM users_recycleuser WHERE role = 'resident'")
    residents = cursor.fetchall()

    cursor.execute("SELECT id FROM users_recycleuser WHERE role = 'service_provider'")
    drivers = [d['id'] for d in cursor.fetchall()]

    sql = """
        INSERT INTO users_pickuprequest (
            status, waste_type, quantity, scheduled_date, 
            pickup_address, region, latitude, longitude, 
            user_id, collector_id, created_at, is_paid,
            actual_quantity, billed_amount, assigned_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    for res in residents:
        # Create 3 Bookings per Resident for a diverse history
        for state in ['pending', 'assigned', 'collected']:
            waste = random.choice(WASTE_TYPES)
            qty = random.randint(5, 50)
            created_at = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d %H:%M:%S')
            
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
                collector_id = random.choice(drivers)
                assigned_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                sched_date = datetime.now().strftime('%Y-%m-%d')
            
            elif state == 'collected':
                collector_id = random.choice(drivers)
                assigned_at = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d %H:%M:%S')
                sched_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
                is_paid = 1 # Mark as paid for History/Wallet testing
                actual_qty = qty + random.uniform(-2, 2)
                billed_amount = actual_qty * 50 # Sample rate of 50 KES per KG

            values = (
                status, waste, qty, sched_date, 
                res['address'], random.choice(REGIONS), res['latitude'], res['longitude'],
                res['id'], collector_id, created_at, is_paid,
                actual_qty, billed_amount, assigned_at
            )
            cursor.execute(sql, values)

    conn.commit()
    print("Success! Lifecycle data generated.")

except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()