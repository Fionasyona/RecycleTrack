import mysql.connector

# --- CONFIGURATION ---
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'recycletrack'
}

def format_list_for_sql(id_list):
    return ', '.join(str(x) for x in id_list)

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # --- STEP 1: Find the Drivers ---
    print("Step 1: Finding the last 14 drivers...")
    cursor.execute("SELECT id FROM users_recycleuser WHERE role = 'service_provider' ORDER BY id DESC LIMIT 14")
    driver_ids = [row[0] for row in cursor.fetchall()]

    if not driver_ids:
        print("No drivers found to delete!")
    else:
        print(f"Found Drivers: {driver_ids}")
        driver_ids_sql = format_list_for_sql(driver_ids)

        # --- STEP 2: Find assigned Pickup Requests ---
        print("Step 2: Checking for assigned pickup requests...")
        cursor.execute(f"SELECT id FROM users_pickuprequest WHERE collector_id IN ({driver_ids_sql})")
        request_ids = [row[0] for row in cursor.fetchall()]

        if request_ids:
            request_ids_sql = format_list_for_sql(request_ids)
            print(f" - Found {len(request_ids)} pickup requests.")

            # --- STEP 3: Delete Notifications ---
            print("Step 3: Deleting notifications...")
            cursor.execute(f"DELETE FROM users_notification WHERE pickup_id IN ({request_ids_sql})")
            
            # --- STEP 4: Delete Pickup Requests ---
            print("Step 4: Deleting pickup requests...")
            cursor.execute(f"DELETE FROM users_pickuprequest WHERE id IN ({request_ids_sql})")
        else:
            print(" - No pickup requests found.")

        # --- STEP 5: Delete Driver Profiles ---
        print("Step 5: Deleting driver profiles...")
        cursor.execute(f"DELETE FROM users_driverprofile WHERE user_id IN ({driver_ids_sql})")

        # --- STEP 6: Delete Wallets (THE NEW FIX) ---
        print("Step 6: Deleting user wallets...")
        cursor.execute(f"DELETE FROM users_wallet WHERE user_id IN ({driver_ids_sql})")
        print(f" - Deleted {cursor.rowcount} wallets.")

        # --- STEP 7: Delete the Drivers ---
        print("Step 7: Deleting the actual users...")
        cursor.execute(f"DELETE FROM users_recycleuser WHERE id IN ({driver_ids_sql})")
        print(f" - Deleted {cursor.rowcount} users.")

        conn.commit()
        print("\nSUCCESS! Database cleaned.")

except mysql.connector.Error as err:
    print(f"\nCRITICAL ERROR: {err}")
    print("No changes were saved.")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()