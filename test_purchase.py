import requests
import json

def test_purchase():
    """Test the purchase endpoint"""
    url = "http://localhost:5000/purchase"
    
    # Test purchase data
    purchase_data = {
        "user_id": 1,
        "item_name": "Apple",
        "quantity": 2,
        "price": 225.0,
        "shipping_address": "Test User, 123 Test Street, Test City - 123456, Phone: 9876543210"
    }
    
    try:
        print("Testing purchase endpoint...")
        print(f"URL: {url}")
        print(f"Data: {json.dumps(purchase_data, indent=2)}")
        
        response = requests.post(url, json=purchase_data, headers={'Content-Type': 'application/json'})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Purchase test successful!")
        else:
            print("❌ Purchase test failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Flask server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get("http://localhost:5000/health")
        print(f"Health Check Status: {response.status_code}")
        print(f"Health Response: {response.text}")
    except Exception as e:
        print(f"Health check failed: {e}")

if __name__ == "__main__":
    print("=== Testing Flask Backend ===")
    test_health()
    print("\n=== Testing Purchase Endpoint ===")
    test_purchase() 