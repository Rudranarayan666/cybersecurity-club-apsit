"""
Complete Pre-Deployment Verification Script
Checks all aspects of the application before deployment
"""

import os
import sys
import requests
from pathlib import Path
from colorama import init, Fore, Style

init(autoreset=True)

def print_header(text):
    print(f"\n{Fore.CYAN}{'='*70}")
    print(f"{Fore.CYAN}{text:^70}")
    print(f"{Fore.CYAN}{'='*70}\n")

def print_section(text):
    print(f"\n{Fore.MAGENTA}{'─'*70}")
    print(f"{Fore.MAGENTA}  {text}")
    print(f"{Fore.MAGENTA}{'─'*70}")

def print_success(text):
    print(f"{Fore.GREEN}✓ {text}")

def print_error(text):
    print(f"{Fore.RED}✗ {text}")

def print_warning(text):
    print(f"{Fore.YELLOW}⚠ {text}")

def print_info(text):
    print(f"{Fore.CYAN}ℹ {text}")

class DeploymentVerifier:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.api_url = f"{self.backend_url}/api"
        self.frontend_url = "http://localhost:5500"
        self.issues = []
        self.warnings = []
        self.success_count = 0
        self.total_checks = 0

    def check(self, condition, success_msg, error_msg):
        """Helper to track checks"""
        self.total_checks += 1
        if condition:
            print_success(success_msg)
            self.success_count += 1
            return True
        else:
            print_error(error_msg)
            self.issues.append(error_msg)
            return False

    def warn(self, message):
        """Add warning"""
        print_warning(message)
        self.warnings.append(message)

    def check_file_structure(self):
        """Verify all necessary files exist"""
        print_section("📁 File Structure Check")
        
        root = Path(__file__).parent.parent
        
        required_files = {
            "Frontend": [
                "index.html",
                "js/api.js",
                "js/auth.js",
                "QUICK_START.md",
                "SETUP_GUIDE.md",
                "start_frontend.ps1"
            ],
            "Backend": [
                "backend/app/main.py",
                "backend/app/config.py",
                "backend/requirements.txt",
                "backend/.env.example",
                "backend/start_backend.ps1",
                "backend/test_connectivity.py",
                "backend/alembic.ini"
            ]
        }
        
        all_exist = True
        for category, files in required_files.items():
            print_info(f"\nChecking {category} files...")
            for file in files:
                file_path = root / file
                if file_path.exists():
                    self.check(True, f"{file}", f"{file} missing")
                else:
                    self.check(False, f"{file}", f"{file} missing")
                    all_exist = False
        
        return all_exist

    def check_backend_config(self):
        """Check backend configuration"""
        print_section("⚙️  Backend Configuration Check")
        
        env_file = Path(__file__).parent / ".env"
        
        if not env_file.exists():
            self.check(False, ".env file exists", ".env file not found - create from .env.example")
            return False
        
        self.check(True, ".env file exists", "")
        
        # Check configuration can be loaded
        try:
            sys.path.insert(0, str(Path(__file__).parent))
            from app.config import settings
            
            self.check(True, "Configuration loads successfully", "Configuration loading failed")
            
            # Check critical settings
            if "localhost:5500" in settings.allowed_origins or "127.0.0.1:5500" in settings.allowed_origins:
                self.check(True, f"CORS configured for frontend (port 5500)", "CORS not configured for port 5500")
            else:
                self.check(False, "", f"CORS allows: {settings.allowed_origins}")
            
            if len(settings.jwt_secret_key) >= 32:
                self.check(True, "JWT_SECRET_KEY is secure (≥32 chars)", "JWT_SECRET_KEY too short")
            else:
                self.check(False, "", "JWT_SECRET_KEY too short - generate longer key")
            
            print_info(f"Database: {settings.database_url.split('@')[1] if '@' in settings.database_url else settings.database_url}")
            print_info(f"Debug mode: {settings.debug}")
            
            return True
            
        except Exception as e:
            self.check(False, "", f"Configuration error: {e}")
            return False

    def check_dependencies(self):
        """Check if all dependencies are available"""
        print_section("📦 Dependencies Check")
        
        required_modules = [
            "fastapi",
            "uvicorn",
            "sqlalchemy",
            "alembic",
            "pydantic",
            "pyjwt",
            "argon2",
            "slowapi",
            "colorama",
            "requests"
        ]
        
        all_installed = True
        for module in required_modules:
            try:
                __import__(module)
                self.check(True, f"{module} installed", "")
            except ImportError:
                self.check(False, "", f"{module} not installed")
                all_installed = False
        
        if not all_installed:
            print_info("\nInstall missing dependencies: pip install -r requirements.txt")
        
        return all_installed

    def check_backend_running(self):
        """Check if backend server is accessible"""
        print_section("🔌 Backend Connectivity Check")
        
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=3)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.check(True, "Backend server is running and healthy", "")
                    return True
                else:
                    self.check(False, "", f"Backend unhealthy: {data}")
                    return False
            else:
                self.check(False, "", f"Backend returned {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            self.check(False, "", "Backend is not running")
            print_warning("Start backend: cd backend && .\\start_backend.ps1")
            return False
        except Exception as e:
            self.check(False, "", f"Connection error: {e}")
            return False

    def check_api_endpoints(self):
        """Test critical API endpoints"""
        print_section("🔗 API Endpoints Check")
        
        endpoints = [
            ("/", "Root endpoint"),
            ("/health", "Health check"),
            ("/docs", "API documentation"),
            ("/api/events", "Events API"),
            ("/api/resources", "Resources API")
        ]
        
        all_working = True
        for path, name in endpoints:
            try:
                url = f"{self.backend_url}{path}"
                response = requests.get(url, timeout=3)
                if response.status_code == 200:
                    self.check(True, f"{name} ({path})", "")
                else:
                    self.check(False, "", f"{name} returned {response.status_code}")
                    all_working = False
            except Exception as e:
                self.check(False, "", f"{name} error: {e}")
                all_working = False
        
        return all_working

    def check_cors_headers(self):
        """Verify CORS configuration"""
        print_section("🔒 CORS Headers Check")
        
        try:
            headers = {
                "Origin": "http://localhost:5500"
            }
            response = requests.get(f"{self.api_url}/events", headers=headers, timeout=3)
            
            cors_header = response.headers.get("Access-Control-Allow-Origin")
            if cors_header and ("localhost:5500" in cors_header or cors_header == "*"):
                self.check(True, f"CORS allows frontend: {cors_header}", "")
                
                # Check credentials
                cred_header = response.headers.get("Access-Control-Allow-Credentials")
                if cred_header == "true":
                    self.check(True, "CORS allows credentials", "")
                else:
                    self.warn("CORS might not allow credentials")
                
                return True
            else:
                self.check(False, "", f"CORS header: {cors_header}")
                print_warning("Update ALLOWED_ORIGINS in backend/.env")
                return False
        except Exception as e:
            self.check(False, "", f"CORS test failed: {e}")
            return False

    def check_security_headers(self):
        """Check security headers"""
        print_section("🛡️  Security Headers Check")
        
        try:
            response = requests.get(self.backend_url, timeout=3)
            
            required_headers = [
                "X-Content-Type-Options",
                "X-Frame-Options",
                "Content-Security-Policy",
                "Strict-Transport-Security",
                "Referrer-Policy"
            ]
            
            all_present = True
            for header in required_headers:
                if header in response.headers:
                    value = response.headers[header]
                    self.check(True, f"{header}: {value[:50]}", "")
                else:
                    self.check(False, "", f"{header} header missing")
                    all_present = False
            
            # Check CSP allows CDN
            csp = response.headers.get("Content-Security-Policy", "")
            if "cdnjs.cloudflare.com" in csp:
                self.check(True, "CSP allows necessary CDN resources", "")
            else:
                self.warn("CSP might block CDN resources")
            
            return all_present
            
        except Exception as e:
            self.check(False, "", f"Security headers test failed: {e}")
            return False

    def check_database(self):
        """Check database connection and tables"""
        print_section("💾 Database Check")
        
        try:
            sys.path.insert(0, str(Path(__file__).parent))
            from app.database import engine
            from sqlalchemy import text
            
            # Test connection
            with engine.connect() as conn:
                self.check(True, "Database connection successful", "")
                
                # Check tables exist
                result = conn.execute(text(
                    "SELECT tablename FROM pg_tables WHERE schemaname='public'"
                ))
                tables = [row[0] for row in result]
                
                required_tables = ["users", "events", "registrations", "resources"]
                for table in required_tables:
                    if table in tables:
                        self.check(True, f"Table '{table}' exists", "")
                    else:
                        self.check(False, "", f"Table '{table}' missing")
                        print_warning("Run migrations: alembic upgrade head")
                
                # Check if admin user exists
                result = conn.execute(text("SELECT COUNT(*) FROM users WHERE username='admin'"))
                count = result.scalar()
                if count > 0:
                    self.check(True, "Admin user exists", "")
                else:
                    self.warn("Admin user not found - run: python scripts/seed_db.py")
                
                return True
                
        except Exception as e:
            self.check(False, "", f"Database error: {e}")
            print_warning("Check DATABASE_URL in .env and ensure PostgreSQL is running")
            return False

    def check_frontend_config(self):
        """Check frontend configuration"""
        print_section("🎨 Frontend Configuration Check")
        
        index_html = Path(__file__).parent.parent / "index.html"
        
        if not index_html.exists():
            self.check(False, "", "index.html not found")
            return False
        
        self.check(True, "index.html exists", "")
        
        content = index_html.read_text()
        
        # Check API configuration
        if "window.API_CONFIG" in content:
            self.check(True, "API configuration present", "")
            
            if "http://localhost:8000/api" in content:
                self.check(True, "API URL configured for development", "")
            else:
                self.warn("API URL might not be configured correctly")
        else:
            self.check(False, "", "API configuration missing in index.html")
        
        # Check CDN resources
        cdns = [
            "fonts.googleapis.com",
            "cdnjs.cloudflare.com"
        ]
        
        for cdn in cdns:
            if cdn in content:
                self.check(True, f"CDN resource: {cdn}", "")
            else:
                self.warn(f"CDN resource missing: {cdn}")
        
        return True

    def run_all_checks(self):
        """Run all verification checks"""
        print_header("PRE-DEPLOYMENT VERIFICATION")
        print(f"{Fore.CYAN}Checking application readiness for deployment...")
        
        # Run all checks
        self.check_file_structure()
        self.check_backend_config()
        self.check_dependencies()
        self.check_backend_running()
        self.check_api_endpoints()
        self.check_cors_headers()
        self.check_security_headers()
        self.check_database()
        self.check_frontend_config()
        
        # Print summary
        print_header("VERIFICATION SUMMARY")
        
        percentage = (self.success_count / self.total_checks * 100) if self.total_checks > 0 else 0
        
        print(f"\n{Fore.CYAN}Results: {Fore.GREEN}{self.success_count}/{self.total_checks} checks passed "
              f"({percentage:.1f}%)\n")
        
        if self.warnings:
            print(f"{Fore.YELLOW}Warnings ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  {Fore.YELLOW}⚠ {warning}")
            print()
        
        if self.issues:
            print(f"{Fore.RED}Issues Found ({len(self.issues)}):")
            for issue in self.issues:
                print(f"  {Fore.RED}✗ {issue}")
            print()
        
        # Final verdict
        if percentage == 100:
            print(f"{Fore.GREEN}{Style.BRIGHT}{'='*70}")
            print(f"{Fore.GREEN}{Style.BRIGHT}🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT! 🎉")
            print(f"{Fore.GREEN}{Style.BRIGHT}{'='*70}\n")
            return 0
        elif percentage >= 80:
            print(f"{Fore.YELLOW}{Style.BRIGHT}{'='*70}")
            print(f"{Fore.YELLOW}{Style.BRIGHT}⚠️  MOSTLY READY - Fix warnings before deployment")
            print(f"{Fore.YELLOW}{Style.BRIGHT}{'='*70}\n")
            return 1
        else:
            print(f"{Fore.RED}{Style.BRIGHT}{'='*70}")
            print(f"{Fore.RED}{Style.BRIGHT}❌ NOT READY - Fix critical issues first")
            print(f"{Fore.RED}{Style.BRIGHT}{'='*70}\n")
            print(f"\n{Fore.YELLOW}Next steps:")
            print(f"  1. Start backend: cd backend && .\\start_backend.ps1")
            print(f"  2. Fix configuration issues in .env")
            print(f"  3. Run this script again")
            return 2

def main():
    verifier = DeploymentVerifier()
    return verifier.run_all_checks()

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(f"\n\n{Fore.YELLOW}Verification interrupted by user")
        sys.exit(130)
