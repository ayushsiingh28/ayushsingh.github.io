import sqlite3
import os

def fix_purchases_table():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shop.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(purchases)")
        columns = [col[1] for col in cursor.fetchall()]
        if 'shipping_address' not in columns:
            cursor.execute("ALTER TABLE purchases ADD COLUMN shipping_address TEXT")
            print("Added shipping_address column.")
        else:
            print("shipping_address column already exists.")
        if 'order_id' not in columns:
            cursor.execute("ALTER TABLE purchases ADD COLUMN order_id TEXT")
            print("Added order_id column.")
        else:
            print("order_id column already exists.")
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_purchases_table() 