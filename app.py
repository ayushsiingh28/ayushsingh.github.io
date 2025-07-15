from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import sqlite3
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
CORS(app)
bcrypt = Bcrypt(app)

# --- Database Setup ---
def get_db():
    # Ensure the database file exists in the current directory
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shop.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    try:
        db.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            password TEXT NOT NULL
        )''')
        db.execute('''CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            item_name TEXT,
            quantity INTEGER,
            price REAL,
            date TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )''')
        db.commit()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

init_db()

# --- API Endpoints ---

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['username', 'email', 'phone', 'address', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        print(f"Registration attempt for username: {data['username']}, email: {data['email']}")
        
        db = get_db()
        try:
            # Check if user already exists
            existing_user = db.execute('SELECT * FROM users WHERE email = ? OR username = ?', 
                                     (data['email'], data['username'])).fetchone()
            if existing_user:
                return jsonify({'error': 'User with this email or username already exists'}), 400
            
            # Hash password
            hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')
            
            # Insert new user
            cursor = db.execute('INSERT INTO users (username, email, phone, address, password) VALUES (?, ?, ?, ?, ?)',
                               (data['username'], data['email'], data['phone'], data['address'], hashed))
            db.commit()
            
            user_id = cursor.lastrowid
            print(f"User {data['username']} registered successfully with ID: {user_id}")
            
            return jsonify({
                'status': 'ok',
                'message': 'Registration successful',
                'user_id': user_id
            })
            
        except sqlite3.IntegrityError as e:
            db.rollback()
            print(f"Registration failed for {data['email']}: {str(e)}")
            return jsonify({'error': 'User with this email or username already exists'}), 400
        except Exception as e:
            db.rollback()
            print(f"Database error during registration: {e}")
            return jsonify({'error': 'Database error occurred'}), 500
        finally:
            db.close()
            
    except Exception as e:
        print(f"Unexpected error in registration: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        print(f"Login attempt for email: {data['email']}")
        
        db = get_db()
        try:
            user = db.execute('SELECT * FROM users WHERE email = ?', (data['email'],)).fetchone()
            
            if user:
                print(f"User found: {user['username']}")
                if bcrypt.check_password_hash(user['password'], data['password']):
                    print(f"Password correct for {user['username']}")
                    return jsonify({
                        'id': user['id'], 
                        'username': user['username'],
                        'email': user['email']
                    })
                else:
                    print(f"Password incorrect for {user['username']}")
                    return jsonify({'error': 'Invalid credentials'}), 400
            else:
                print(f"No user found with email: {data['email']}")
                return jsonify({'error': 'Invalid credentials'}), 400
                
        except Exception as e:
            print(f"Database error during login: {e}")
            return jsonify({'error': 'Database error occurred'}), 500
        finally:
            db.close()
            
    except Exception as e:
        print(f"Unexpected error in login: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/purchase', methods=['POST'])
def purchase():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        required_fields = ['user_id', 'item_name', 'quantity', 'price']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get shipping address from data (optional for backward compatibility)
        shipping_address = data.get('shipping_address', '')
        
        # Generate order ID
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        order_id = f"ORD{timestamp}"
        
        db = get_db()
        try:
            cursor = db.execute('INSERT INTO purchases (user_id, item_name, quantity, price, date, shipping_address, order_id) VALUES (?, ?, ?, ?, datetime("now"), ?, ?)',
                       (data['user_id'], data['item_name'], data['quantity'], data['price'], shipping_address, order_id))
            db.commit()
            purchase_id = cursor.lastrowid
            
            return jsonify({
                'status': 'ok', 
                'message': 'Purchase recorded successfully',
                'order_id': order_id,
                'purchase_id': purchase_id
            })
        except Exception as e:
            db.rollback()
            print(f"Error recording purchase: {e}")
            return jsonify({'error': 'Failed to record purchase'}), 500
        finally:
            db.close()
    except Exception as e:
        print(f"Unexpected error in purchase: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/purchases/<int:user_id>', methods=['GET'])
def get_purchases(user_id):
    try:
        db = get_db()
        purchases = db.execute('''
            SELECT p.*, u.username, u.email 
            FROM purchases p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.user_id = ? 
            ORDER BY p.date DESC, p.id DESC
        ''', (user_id,)).fetchall()
        db.close()
        return jsonify([dict(row) for row in purchases])
    except Exception as e:
        print(f"Error fetching purchases: {e}")
        return jsonify({'error': 'Failed to fetch purchases'}), 500

@app.route('/purchases', methods=['GET'])
def get_all_purchases():
    try:
        db = get_db()
        purchases = db.execute('''
            SELECT p.*, u.username, u.email 
            FROM purchases p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.date DESC, p.id DESC
        ''').fetchall()
        db.close()
        return jsonify([dict(row) for row in purchases])
    except Exception as e:
        print(f"Error fetching all purchases: {e}")
        return jsonify({'error': 'Failed to fetch purchases'}), 500

@app.route('/purchases/summary', methods=['GET'])
def get_purchase_summary():
    try:
        db = get_db()
        # Get total purchases count
        total_purchases = db.execute('SELECT COUNT(*) as count FROM purchases').fetchone()['count']
        
        # Get total revenue
        total_revenue = db.execute('SELECT SUM(price * quantity) as total FROM purchases').fetchone()['total'] or 0
        
        # Get purchases by item
        item_stats = db.execute('''
            SELECT item_name, COUNT(*) as count, SUM(quantity) as total_quantity, SUM(price * quantity) as total_revenue
            FROM purchases 
            GROUP BY item_name 
            ORDER BY total_revenue DESC
        ''').fetchall()
        
        # Get recent purchases (last 10)
        recent_purchases = db.execute('''
            SELECT p.*, u.username 
            FROM purchases p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.date DESC, p.id DESC 
            LIMIT 10
        ''').fetchall()
        
        db.close()
        
        return jsonify({
            'total_purchases': total_purchases,
            'total_revenue': total_revenue,
            'item_stats': [dict(row) for row in item_stats],
            'recent_purchases': [dict(row) for row in recent_purchases]
        })
    except Exception as e:
        print(f"Error fetching purchase summary: {e}")
        return jsonify({'error': 'Failed to fetch purchase summary'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'})

if __name__ == '__main__':
    print("Starting Flask server...")
    print("Database file location:", os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shop.db'))
    app.run(debug=True, host='0.0.0.0', port=5000) 