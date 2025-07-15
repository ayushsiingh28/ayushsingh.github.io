import sqlite3
from datetime import datetime

def view_database():
    print("=" * 60)
    print("           FRUIT SHOP DATABASE VIEWER")
    print("=" * 60)
    
    conn = sqlite3.connect('shop.db')
    cursor = conn.cursor()
    
    # View Users Table
    print("\n📋 USERS TABLE:")
    print("-" * 60)
    cursor.execute("SELECT id, username, email, phone, address FROM users ORDER BY id DESC")
    users = cursor.fetchall()
    
    if users:
        print(f"{'ID':<3} {'Username':<15} {'Email':<25} {'Phone':<15} {'Address':<20}")
        print("-" * 80)
        for user in users:
            print(f"{user[0]:<3} {user[1]:<15} {user[2]:<25} {user[3]:<15} {user[4]:<20}")
        print(f"\nTotal Users: {len(users)}")
    else:
        print("No users found in database")
    
    # View Purchases Table
    print("\n🛒 PURCHASES TABLE:")
    print("-" * 60)
    cursor.execute("SELECT id, user_id, item_name, quantity, price, date FROM purchases ORDER BY id DESC")
    purchases = cursor.fetchall()
    
    if purchases:
        print(f"{'ID':<3} {'User ID':<8} {'Item':<15} {'Qty':<5} {'Price':<10} {'Date':<12}")
        print("-" * 60)
        for purchase in purchases:
            print(f"{purchase[0]:<3} {purchase[1]:<8} {purchase[2]:<15} {purchase[3]:<5} ₹{purchase[4]:<9} {purchase[5]:<12}")
        print(f"\nTotal Purchases: {len(purchases)}")
    else:
        print("No purchases found in database")
    
    # Database Statistics
    print("\n📊 DATABASE STATISTICS:")
    print("-" * 30)
    print(f"Total Users: {len(users)}")
    print(f"Total Purchases: {len(purchases)}")
    
    # Show latest activity
    if users:
        latest_user = users[0]
        print(f"\n🆕 Latest User: {latest_user[1]} ({latest_user[2]}) - ID: {latest_user[0]}")
    
    if purchases:
        latest_purchase = purchases[0]
        print(f"🆕 Latest Purchase: {latest_purchase[2]} x{latest_purchase[3]} - ₹{latest_purchase[4]}")
    
    conn.close()
    
    print("\n" + "=" * 60)
    print("Database file: shop.db")
    print("=" * 60)

if __name__ == "__main__":
    view_database() 