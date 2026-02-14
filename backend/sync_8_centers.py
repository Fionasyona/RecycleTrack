import mysql.connector

# --- CONFIGURATION ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'recycletrack'
}

# The complete list of 8 centers matching your table structure
CENTERS_TO_SYNC = [
    # IDs 1, 2, 3 (Replacements)
    {"id": 1, "name": "Okana Interactive (Kilimani)", "accepted_materials": "Paper & Plastic", "address": "Kilimani, Nairobi", "latitude": -1.2897, "longitude": 36.7833, "phone": "0733000111"},
    {"id": 2, "name": "Intl. Center for Waste Management", "accepted_materials": "Hazardous & Medical", "address": "Mlolongo, Mombasa Road", "latitude": -1.3941, "longitude": 36.9422, "phone": "0744000222"},
    {"id": 3, "name": "Nairobi County Depot (Dandora)", "accepted_materials": "General Recyclables", "address": "Dandora, Nairobi", "latitude": -1.2483, "longitude": 36.8972, "phone": "0755000333"},
    
    # IDs 4, 5 (Previous Additions)
    {"id": 4, "name": "Pure Planet Recyclers (Mowlem)", "accepted_materials": "Plastic & Composting", "address": "Mowlem, Nairobi", "latitude": -1.2785, "longitude": 36.8962, "phone": "0721282548"},
    {"id": 5, "name": "E-waste Initiative Kenya (Ngara)", "accepted_materials": "Electronic Waste", "address": "Ngara, Nairobi", "latitude": -1.2736, "longitude": 36.8234, "phone": "0722109876"},
    
    # IDs 6, 7, 8 (New Additions)
    {"id": 6, "name": "WEEE Centre (Utawala)", "accepted_materials": "Electronic Waste", "address": "Utawala, Nairobi", "latitude": -1.2721, "longitude": 36.9580, "phone": "0717569971"},
    {"id": 7, "name": "TakaTaka Solutions (Kangemi)", "accepted_materials": "Organic & Inorganic", "address": "Kangemi, Nairobi", "latitude": -1.2667, "longitude": 36.7500, "phone": "0700000000"},
    {"id": 8, "name": "Mr. Green Africa (Industrial Area)", "accepted_materials": "Plastic", "address": "Industrial Area, Nairobi", "latitude": -1.3032, "longitude": 36.8475, "phone": "0712345678"}
]

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("Connected! Syncing 8 recycling centers...")

    # 1. Clear existing data to ensure a fresh, synchronized state
    cursor.execute("DELETE FROM centers_recyclingcenter")
    
    # 2. Insert the full list
    sql = """
        INSERT INTO centers_recyclingcenter (
            id, name, accepted_materials, address, latitude, longitude, phone, created_at, updated_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    """

    for center in CENTERS_TO_SYNC:
        values = (
            center["id"], center["name"], center["accepted_materials"], 
            center["address"], center["latitude"], center["longitude"], 
            center["phone"]
        )
        cursor.execute(sql, values)

    conn.commit()
    print(f"Success! All {len(CENTERS_TO_SYNC)} centers are now updated in your database.")

except mysql.connector.Error as err:
    print(f"Error: {err}")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()