import sqlite3

def check_database():
    conn = sqlite3.connect('shop.db')
    cursor = conn.cursor()
    
    print("=== USERS TABLE ===")
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    if users:
        print("Users in database:")
        for user in users:
            print(f"ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Phone: {user[3]}, Address: {user[4]}")
    else:
        print("No users found in database")
    
    print("\n=== PURCHASES TABLE ===")
    cursor.execute("SELECT * FROM purchases")
    purchases = cursor.fetchall()
    if purchases:
        print("Purchases in database:")
        for purchase in purchases:
            print(f"ID: {purchase[0]}, User ID: {purchase[1]}, Item: {purchase[2]}, Qty: {purchase[3]}, Price: {purchase[4]}, Date: {purchase[5]}")
    else:
        print("No purchases found in database")
    
    conn.close()

if __name__ == "__main__":
    check_database() 