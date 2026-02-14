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
    print("Connected! Generating 120 additional random lifecycle tasks...")

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

    # We loop through residents and create 6 tasks each (6 * 20 = 120)
    for res in residents:
        # Distribution: 2 Pending, 2 Assigned, 2 Collected per resident
        task_states = ['pending', 'pending', 'assigned', 'assigned', 'collected', 'collected']
        
        for state in task_states:
            waste = random.choice(WASTE_TYPES)
            qty = random.randint(5, 50)
            created_at = (datetime.now() - timedelta(days=random.randint(5, 10))).strftime('%Y-%m-%d %H:%M:%S')
            
            # Reset defaults for each task
            collector_id = None
            assigned_at = None
            is_paid = 0
            actual_qty = 0.00
            billed_amount = 0.00
            status = state

            if state == 'pending':
                # Scheduled for the future
                sched_date = (datetime.now() + timedelta(days=random.randint(1, 5))).strftime('%Y-%m-%d')
            
            elif state == 'assigned':
                # Assigned to a random service provider
                collector_id = random.choice(drivers)
                assigned_at = (datetime.now() - timedelta(hours=random.randint(1, 24))).strftime('%Y-%m-%d %H:%M:%S')
                sched_date = datetime.now().strftime('%Y-%m-%d')
            
            elif state == 'collected':
                # Completed tasks for Job History
                collector_id = random.choice(drivers)
                assigned_at = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d %H:%M:%S')
                sched_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
                is_paid = 1 
                actual_qty = qty + random.uniform(-1, 3)
                # Formula matching your collector dashboard: 100 Base + 20% of bill (simplified here to just the bill)
                billed_amount = actual_qty * 50 

            values = (
                status, waste, qty, sched_date, 
                res['address'], random.choice(REGIONS), res['latitude'], res['longitude'],
                res['id'], collector_id, created_at, is_paid,
                actual_qty, billed_amount, assigned_at
            )
            cursor.execute(sql, values)

    conn.commit()
    print("Success! 120 new tasks generated across all lifecycle stages.")

except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()