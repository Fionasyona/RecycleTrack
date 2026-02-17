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

    print("Connected! Preparing to delete the last 17 Residents...")

    # --- STEP 1: Find the target Users (Residents) ---
    # Updated to LIMIT 17 as requested
    cursor.execute("""
        SELECT id FROM users_recycleuser 
        WHERE role = 'resident' 
        ORDER BY id DESC 
        LIMIT 17
    """)
    
    rows = cursor.fetchall()
    user_ids = [row[0] for row in rows]

    if not user_ids:
        print("No residents found to delete!")
    else:
        print(f"Found {len(user_ids)} residents to delete.")
        print(f"IDs: {user_ids}")
        
        # Format IDs for SQL
        id_string = format_list_for_sql(user_ids)

        # --- STEP 2: Delete Wallets ---
        print("Step 2: Cleaning up Wallets...")
        cursor.execute(f"DELETE FROM users_wallet WHERE user_id IN ({id_string})")
        print(f" - Deleted {cursor.rowcount} wallets.")

        # --- STEP 3: Delete Withdrawal Requests (THE NEW FIX) ---
        print("Step 3: Cleaning up Withdrawal Requests...")
        cursor.execute(f"DELETE FROM users_withdrawalrequest WHERE user_id IN ({id_string})")
        print(f" - Deleted {cursor.rowcount} withdrawal requests.")

        # --- STEP 4: Delete Recycling Logs ---
        print("Step 4: Cleaning up Recycling Logs...")
        cursor.execute(f"DELETE FROM users_recyclinglog WHERE user_id IN ({id_string})")
        print(f" - Deleted {cursor.rowcount} recycling logs.")

        # --- STEP 5: Delete Pickup Requests & Notifications ---
        print("Step 5: Cleaning up Pickup Requests...")
        try:
            # Get request IDs first so we can delete their notifications
            cursor.execute(f"SELECT id FROM users_pickuprequest WHERE user_id IN ({id_string})")
            request_ids = [r[0] for r in cursor.fetchall()]
            
            if request_ids:
                req_id_string = format_list_for_sql(request_ids)
                # 5a. Delete Notifications first (child of request)
                cursor.execute(f"DELETE FROM users_notification WHERE pickup_id IN ({req_id_string})")
                # 5b. Delete Requests (child of user)
                cursor.execute(f"DELETE FROM users_pickuprequest WHERE id IN ({req_id_string})")
                print(f" - Deleted {len(request_ids)} pickup requests and their notifications.")
            else:
                print(" - No pickup requests found.")

        except mysql.connector.Error as err:
            print(f" (Warning: Issue clearing requests: {err})")

        # --- STEP 6: Delete the Users ---
        print("Step 6: Deleting the actual users...")
        cursor.execute(f"DELETE FROM users_recycleuser WHERE id IN ({id_string})")
        print(f" - Successfully deleted {cursor.rowcount} users.")

        conn.commit()
        print("\nSUCCESS! Database cleaned.")

except mysql.connector.Error as err:
    print(f"\nCRITICAL ERROR: {err}")
    print("No changes were saved.")

finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()