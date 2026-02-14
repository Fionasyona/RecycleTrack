import mysql.connector
import random

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'recycletrack'
}

CENTERS = [
    {"id": 1, "name": "Okana Interactive (Kilimani)", "materials": "Paper & Plastic", "address": "Kilimani, Nairobi", "lat": -1.2897, "lng": 36.7833, "phone": "0733000111"},
    {"id": 2, "name": "Intl. Center for Waste Management", "materials": "Hazardous & Medical", "address": "Mlolongo, Mombasa Road", "lat": -1.3941, "lng": 36.9422, "phone": "0744000222"},
    {"id": 3, "name": "Nairobi County Depot (Dandora)", "materials": "General Recyclables", "address": "Dandora, Nairobi", "lat": -1.2483, "lng": 36.8972, "phone": "0755000333"},
    {"id": 4, "name": "Pure Planet Recyclers (Mowlem)", "materials": "Plastic & Composting", "address": "Mowlem, Nairobi", "lat": -1.2785, "lng": 36.8962, "phone": "0721282548"},
    {"id": 5, "name": "E-waste Initiative Kenya (Ngara)", "materials": "Electronic Waste", "address": "Ngara, Nairobi", "lat": -1.2736, "lng": 36.8234, "phone": "0722109876"},
    {"id": 6, "name": "WEEE Centre (Utawala)", "materials": "Electronic Waste", "address": "Utawala, Nairobi", "lat": -1.2721, "lng": 36.9580, "phone": "0717569971"},
    {"id": 7, "name": "TakaTaka Solutions (Kangemi)", "materials": "Organic & Inorganic", "address": "Kangemi, Nairobi", "lat": -1.2667, "lng": 36.7500, "phone": "0700000000"},
    {"id": 8, "name": "Mr. Green Africa (Industrial Area)", "materials": "Plastic", "address": "Industrial Area, Nairobi", "lat": -1.3032, "lng": 36.8475, "phone": "0712345678"}
]

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # 1. Disable Foreign Keys to allow table cleaning
    cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
    
    # 2. Check which table actually exists to avoid "Table not found" errors
    cursor.execute("SHOW TABLES LIKE 'users_recyclingcenter'")
    if cursor.fetchone():
        target_table = 'users_recyclingcenter'
    else:
        target_table = 'centers_recyclingcenter'
        
    print(f"Targeting table: {target_table}")

    # 3. Clear and Reset
    cursor.execute(f"DELETE FROM {target_table}")
    
    # 4. Insert data using exact names from your screenshot
    # If this fails, replace 'accepted_materials' with 'waste_type' below
    sql = f"""
        INSERT INTO {target_table} (
            id, name, accepted_materials, address, latitude, longitude, phone, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    """
    
    for c in CENTERS:
        cursor.execute(sql, (c['id'], c['name'], c['materials'], c['address'], c['lat'], c['lng'], c['phone']))

    # 5. Link the 180 tasks
    print("Linking tasks...")
    cursor.execute("SELECT id FROM users_pickuprequest")
    pickup_ids = [row[0] for row in cursor.fetchall()]

    for p_id in pickup_ids:
        cursor.execute("UPDATE users_pickuprequest SET center_id = %s WHERE id = %s", (random.randint(1, 8), p_id))

    cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
    conn.commit()
    print("Success! Database is now synchronized.")

except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    conn.close()