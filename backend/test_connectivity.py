"""
Backend Connectivity Test Script
Tests backend server connectivity and API endpoints
"""

import requests
import sys
from colorama import init, Fore, Style

# Initialize colorama for colored output
init(autoreset=True)

BACKEND_URL = "http://localhost:8000"
API_BASE = f"{BACKEND_URL}/api"

def print_header(text):
    """Print a formatted header"""
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{Fore.CYAN}{text:^60}")
    print(f"{Fore.CYAN}{'='*60}\n")

def print_success(text):
    """Print success message"""
    print(f"{Fore.GREEN}✓ {text}")

def print_error(text):
    """Print error message"""
    print(f"{Fore.RED}✗ {text}")

def print_info(text):
    """Print info message"""
    print(f"{Fore.YELLOW}ℹ {text}")

def test_health_endpoint():
    """Test the health check endpoint"""
    print_info("Testing health endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                print_success("Health check passed")
                return True
            else:
                print_error(f"Health check failed: {data}")
                return False
        else:
            print_error(f"Health endpoint returned {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend - is it running?")
        return False
    except Exception as e:
        print_error(f"Health check error: {e}")
        return False

def test_cors_headers():
    """Test CORS configuration"""
    print_info("Testing CORS headers...")
    try:
        headers = {"Origin": "http://localhost:5500"}
        response = requests.get(f"{API_BASE}/events", headers=headers, timeout=5)
        
        cors_header = response.headers.get("Access-Control-Allow-Origin")
        if cors_header:
            if "localhost:5500" in cors_header or cors_header == "*":
                print_success(f"CORS configured correctly: {cors_header}")
                return True
            else:
                print_error(f"CORS allows {cors_header}, but frontend is on localhost:5500")
                return False
        else:
            print_error("No CORS headers found - check middleware configuration")
            return False
    except Exception as e:
        print_error(f"CORS test error: {e}")
        return False

def test_events_endpoint():
    """Test events endpoint"""
    print_info("Testing events endpoint...")
    try:
        response = requests.get(f"{API_BASE}/events", timeout=5)
        if response.status_code == 200:
            events = response.json()
            print_success(f"Events endpoint working ({len(events)} events)")
            return True
        else:
            print_error(f"Events endpoint returned {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Events endpoint error: {e}")
        return False

def test_resources_endpoint():
    """Test resources endpoint"""
    print_info("Testing resources endpoint...")
    try:
        response = requests.get(f"{API_BASE}/resources", timeout=5)
        if response.status_code == 200:
            resources = response.json()
            print_success(f"Resources endpoint working ({len(resources)} resources)")
            return True
        else:
            print_error(f"Resources endpoint returned {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Resources endpoint error: {e}")
        return False

def test_security_headers():
    """Test security headers"""
    print_info("Testing security headers...")
    try:
        response = requests.get(BACKEND_URL, timeout=5)
        headers_to_check = [
            "X-Content-Type-Options",
            "X-Frame-Options",
            "Content-Security-Policy",
            "Strict-Transport-Security"
        ]
        
        missing = []
        for header in headers_to_check:
            if header not in response.headers:
                missing.append(header)
        
        if not missing:
            print_success("All security headers present")
            
            # Check CSP allows CDN
            csp = response.headers.get("Content-Security-Policy", "")
            if "cdnjs.cloudflare.com" in csp and "fonts.googleapis.com" in csp:
                print_success("CSP allows necessary CDN resources")
            else:
                print_error("CSP may block CDN resources")
            
            return True
        else:
            print_error(f"Missing security headers: {', '.join(missing)}")
            return False
    except Exception as e:
        print_error(f"Security headers test error: {e}")
        return False

def test_api_docs():
    """Test API documentation availability"""
    print_info("Testing API documentation...")
    try:
        response = requests.get(f"{BACKEND_URL}/docs", timeout=5)
        if response.status_code == 200:
            print_success("API documentation available at /docs")
            return True
        else:
            print_error(f"API docs returned {response.status_code}")
            return False
    except Exception as e:
        print_error(f"API docs test error: {e}")
        return False

def main():
    """Run all connectivity tests"""
    print_header("BACKEND CONNECTIVITY TEST SUITE")
    
    print(f"{Fore.CYAN}Backend URL: {Fore.WHITE}{BACKEND_URL}")
    print(f"{Fore.CYAN}API Base: {Fore.WHITE}{API_BASE}\n")
    
    tests = [
        ("Health Check", test_health_endpoint),
        ("CORS Configuration", test_cors_headers),
        ("Events API", test_events_endpoint),
        ("Resources API", test_resources_endpoint),
        ("Security Headers", test_security_headers),
        ("API Documentation", test_api_docs)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{Fore.MAGENTA}[Test] {test_name}")
        result = test_func()
        results.append((test_name, result))
    
    # Summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        if result:
            print_success(f"{test_name}")
        else:
            print_error(f"{test_name}")
    
    print(f"\n{Fore.CYAN}Results: {Fore.GREEN}{passed}/{total} tests passed")
    
    if passed == total:
        print(f"\n{Fore.GREEN}{Style.BRIGHT}🎉 All tests passed! Backend is ready for frontend connection.")
        return 0
    else:
        print(f"\n{Fore.RED}{Style.BRIGHT}⚠ Some tests failed. Check the errors above.")
        print(f"\n{Fore.YELLOW}Common fixes:")
        print(f"  1. Make sure backend is running: uvicorn app.main:app --reload")
        print(f"  2. Check .env file has correct CORS settings")
        print(f"  3. Restart backend after config changes")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(f"\n\n{Fore.YELLOW}Test interrupted by user")
        sys.exit(130)
