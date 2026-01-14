# 🚀 Quick Setup & Testing Guide

## ✅ Setup Complete!

I've fixed all the critical connectivity issues between your frontend and backend. Here's what was changed:

### 🔧 Changes Made

#### Backend Fixes
1. **CORS Configuration** (`backend/app/config.py`)
   - ✅ Changed port from 3000 to 5500
   - ✅ Added both `localhost` and `127.0.0.1` to allowed origins

2. **Security Headers** (`backend/app/middleware/security_headers.py`)
   - ✅ Updated CSP to allow CDN resources (Google Fonts, Font Awesome, GSAP, Three.js)
   - ✅ Maintained security while enabling frontend assets

3. **Environment Template** (`backend/.env.example`)
   - ✅ Created comprehensive .env.example file with all required variables
   - ✅ Added security notes and production guidelines

#### Frontend Fixes
1. **API Configuration** (`index.html`)
   - ✅ Added centralized API configuration
   - ✅ Made base URL easily configurable per environment

2. **API Service** (`js/api.js`)
   - ✅ Added timeout support (30 seconds)
   - ✅ Improved error handling for different error formats
   - ✅ Added debug logging for development
   - ✅ Better download filename extraction
   - ✅ Network error detection

3. **Security** (`index.html`)
   - ✅ Removed insecure client-side admin authentication
   - ✅ Admin now uses proper JWT login flow

---

## 📋 Setup Instructions

### Step 1: Configure Backend Environment

```bash
cd backend

# Copy the environment template
cp .env.example .env

# Edit .env with your actual values
# Required changes:
# - DATABASE_URL (your PostgreSQL connection)
# - JWT_SECRET_KEY (generate a secure random key)
```

**Generate a secure JWT secret:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 2: Install Backend Dependencies

```bash
# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
.venv\Scripts\Activate.ps1  # Windows PowerShell
# OR
.venv\Scripts\activate.bat  # Windows CMD
# OR
source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Setup Database

```bash
# Make sure PostgreSQL is running

# Run migrations
alembic upgrade head

# Create admin user (run the seed script)
python scripts/seed_db.py
```

Default admin credentials after seeding:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change this password immediately after first login!**

### Step 4: Start Backend Server

```bash
# From backend directory
uvicorn app.main:app --reload

# Server will start on: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Step 5: Start Frontend Server

**Option A: Using Python**
```bash
# From project root directory
python -m http.server 5500
```

**Option B: Using Node.js**
```bash
npx http-server -p 5500
```

**Option C: Using VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"
- Make sure it's running on port 5500

### Step 6: Test the Application

Open your browser and navigate to:
```
http://localhost:5500
```

---

## 🧪 Testing Checklist

### Backend Health Check
1. Open: http://localhost:8000/health
   - Should return: `{"status":"healthy"}`

2. Open: http://localhost:8000/docs
   - Should see Swagger API documentation

3. Test CORS:
   ```bash
   curl -H "Origin: http://localhost:5500" -v http://localhost:8000/api/events
   ```
   - Look for `Access-Control-Allow-Origin: http://localhost:5500` in response headers

### Frontend Tests

1. **Open Browser Console** (F12)
   - No CORS errors should appear
   - Should see: `[API] GET /events` (debug log)

2. **Check Event Loading**
   - Scroll to "Events" section
   - Events should load from backend
   - Check console for API success logs

3. **Check Resources Loading**
   - Scroll to "Resources" section
   - Resources should load from backend

4. **Test Registration**
   - Click "Register" on an event
   - Fill in the form
   - Submit
   - Check console for API logs
   - Should see success toast message

5. **Test Admin Login**
   - Click "Admin Login"
   - Enter credentials (admin/admin123)
   - Should receive JWT token
   - Check localStorage for `authToken`

6. **Test Admin Event Creation** (after login)
   - Use admin modal to create event
   - Should work with JWT authentication

---

## 🐛 Troubleshooting

### Issue: CORS Errors in Console

**Error:** `Access to fetch at 'http://localhost:8000/api/events' from origin 'http://localhost:5500' has been blocked by CORS policy`

**Solution:**
1. Check backend `.env` file has: `ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500`
2. Restart backend server
3. Clear browser cache (Ctrl+Shift+Del)

### Issue: Frontend Assets Not Loading (Fonts, Icons)

**Error:** Content Security Policy violation

**Solution:**
- Verify `backend/app/middleware/security_headers.py` has the updated CSP
- Restart backend server

### Issue: "Network error - cannot connect to server"

**Possible Causes:**
1. Backend not running → Start with `uvicorn app.main:app --reload`
2. Wrong port → Check backend is on port 8000
3. Database not running → Start PostgreSQL

**Check Backend Status:**
```bash
curl http://localhost:8000/health
```

### Issue: Database Connection Error

**Error:** `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution:**
1. Make sure PostgreSQL is running
2. Check DATABASE_URL in `.env` is correct
3. Create database if it doesn't exist:
   ```sql
   CREATE DATABASE cybersec_club;
   ```

### Issue: JWT Token Expired

**Error:** 401 Unauthorized on API calls

**Solution:**
- Login again to get new token
- Tokens expire after 1 hour (configurable in .env)

### Issue: Admin Login Not Working

**Solution:**
1. Make sure backend is running
2. Check credentials (default: admin/admin123)
3. Check browser console for errors
4. Verify JWT_SECRET_KEY is set in `.env`

---

## 🔍 Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads without CORS errors
- [ ] Events load from backend
- [ ] Resources load from backend
- [ ] Event registration works
- [ ] Admin login works and returns JWT token
- [ ] Admin can create events
- [ ] Resource download works
- [ ] Dark mode toggle works
- [ ] All CDN assets load (fonts, icons, GSAP, Three.js)

---

## 📊 API Endpoints Summary

### Public Endpoints (No Auth Required)
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/events` - List events
- `GET /api/events/{id}` - Get single event
- `GET /api/resources` - List resources
- `GET /api/resources/{id}/download` - Download resource
- `POST /api/registrations` - Register for event

### Protected Endpoints (JWT Required)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event
- `GET /api/registrations` - List all registrations
- `POST /api/resources` - Upload resource
- `DELETE /api/resources/{id}` - Delete resource

---

## 🎯 Next Steps

1. **Test Everything:**
   - Go through the testing checklist above
   - Register for an event
   - Login as admin and create an event

2. **Change Default Password:**
   ```bash
   # After logging in as admin, change the password
   # You can do this by updating the database or creating a password change endpoint
   ```

3. **Production Deployment:**
   - Update `.env` with production values
   - Set `DEBUG=False`
   - Use HTTPS URLs
   - Update ALLOWED_ORIGINS to production domain
   - Generate new JWT_SECRET_KEY

4. **Optional Enhancements:**
   - Add password change functionality
   - Add user profile page
   - Add pagination for events/resources
   - Add search/filter functionality

---

## 🆘 Getting Help

If you encounter any issues:

1. **Check Browser Console** (F12) for error messages
2. **Check Backend Logs** in the terminal where uvicorn is running
3. **Verify Environment Variables** in `.env`
4. **Test API Directly** using http://localhost:8000/docs

Common files to check:
- `backend/.env` - Environment configuration
- `backend/app/config.py` - CORS settings
- `backend/app/middleware/security_headers.py` - CSP settings
- `js/api.js` - API service configuration

---

## ✅ Success Indicators

You'll know everything is working when:
1. ✅ Frontend loads without console errors
2. ✅ Events appear in the Events section
3. ✅ You can register for an event successfully
4. ✅ Admin login returns a token
5. ✅ You can create events as admin
6. ✅ Resources can be downloaded

**The connectivity between frontend and backend is now properly configured!** 🎉
