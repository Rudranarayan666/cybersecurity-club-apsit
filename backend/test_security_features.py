import requests
import json

BASE_URL = "http://localhost:8000"

print("--- SECURITY FEATURE TESTS ---")

# 1. Security Headers
print("\n[+] Testing Security Headers...")
try:
    response = requests.get(f"{BASE_URL}/health")
    headers = response.headers
    print("Headers received:")
    for h in ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection', 'Strict-Transport-Security', 'Content-Security-Policy']:
        print(f"  {h}: {headers.get(h, 'NOT FOUND')}")
except Exception as e:
    print(f"Error: {e}")

# 2. CORS Response
print("\n[+] Testing CORS Header (Origin)..")
try:
    # Use the expected allowed origin
    test_headers = {"Origin": "http://localhost:5500"}
    response = requests.options(f"{BASE_URL}/api/auth/login", headers=test_headers)
    print(f"  Access-Control-Allow-Origin: {response.headers.get('Access-Control-Allow-Origin', 'NOT FOUND')}")
    print(f"  Access-Control-Allow-Credentials: {response.headers.get('Access-Control-Allow-Credentials', 'NOT FOUND')}")
except Exception as e:
    print(f"Error: {e}")

# 3. Rate Limiting Test
print("\n[+] Testing Rate Limiting (Spamming Auth Endpoint)...")
try:
    rate_limited = False
    for i in range(10): # Assuming rate limit is low for auth endpoint like 5/min
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"username":"test","password":"pwd"})
        if r.status_code == 429:
            print(f"  Rate Limit Triggered on request {i+1}!")
            rate_limited = True
            break
    if not rate_limited:
        print("  Rate Limit NOT Triggered (or limit is > 10)")
except Exception as e:
    print(f"Error: {e}")

# 4. Input Validation (Auth Validation error check)
print("\n[+] Testing Request Validation (Malformed body)...")
try:
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"bad_field":"test"})
    print(f"  Status Code: {r.status_code} (Expected 422 for unprocessable entity)")
    if r.status_code == 422:
        print("  Validation logic working.")
except Exception as e:
    print(f"Error: {e}")

# 5. Method Not Allowed (Route Security)
print("\n[+] Testing Missing/Disallowed Methods...")
try:
    r = requests.delete(f"{BASE_URL}/health")
    print(f"  Status Code: {r.status_code} (Expected 405 Method Not Allowed)")
except Exception as e:
    print(f"Error: {e}")

# 6. Auth verification (Missing JWT check)
print("\n[+] Testing JWT Endpoint Protection...")
try:
    r = requests.get(f"{BASE_URL}/api/events") # Assuming events need auth for POST, but maybe GET is public?
    print(f"  GET /api/events status code: {r.status_code}")
    
    # Try a protected endpoint (auth me)
    r = requests.get(f"{BASE_URL}/api/auth/me")
    print(f"  GET /api/auth/me (No token) status: {r.status_code} (Expected 401 Unauthorized)")
except Exception as e:
    print(f"Error: {e}")

