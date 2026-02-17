import mysql.connector

# --- CONFIGURATION ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',  # Empty string since you reset the system folder
    'database': 'recycletrack'
}

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()
    print("Connected! Syncing recycling center tables...")

    # 1. Disable checks (Safety Override)
    cursor.execute("SET FOREIGN_KEY_CHECKS=0")

    # 2. Copy data with COLUMN MAPPING
    # We take 'phone' from the source and put it into 'contact_info' in the destination
    sync_sql = """
        INSERT INTO users_recyclingcenter (id, name, address, latitude, longitude, contact_info)
        SELECT id, name, address, latitude, longitude, phone
        FROM centers_recyclingcenter
        WHERE id NOT IN (SELECT id FROM users_recyclingcenter);
    """
    
    cursor.execute(sync_sql)
    rows_copied = cursor.rowcount
    
    # 3. Re-enable checks
    cursor.execute("SET FOREIGN_KEY_CHECKS=1")
    conn.commit()

    if rows_copied > 0:
        print(f"✅ Success! Copied {rows_copied} missing centers.")
    else:
        print("✅ Success! Tables were already in sync.")

except mysql.connector.Error as err:
    print(f"❌ Error: {err}")
    print("\nTroubleshooting Tip:")
    print("If it still fails, check the 'users_recyclingcenter' columns in PHPMyAdmin.") 
    print("It might simply be missing the phone/contact column entirely.")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()