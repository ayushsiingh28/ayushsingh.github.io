import requests
import json

def test_registration():
    url = "http://localhost:5000/register"
    data = {
        "username": "testuser123",
        "email": "test123@example.com",
        "phone": "1234567890",
        "address": "Test Address",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_login():
    url = "http://localhost:5000/login"
    data = {
        "email": "test123@example.com",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Login Status Code: {response.status_code}")
        print(f"Login Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Login Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Registration...")
    if test_registration():
        print("Registration successful!")
        print("\nTesting Login...")
        if test_login():
            print("Login successful!")
        else:
            print("Login failed!")
    else:
        print("Registration failed!") 