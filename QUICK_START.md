# 🚀 QUICK START FOR DEPLOYMENT

## For Tomorrow's Deployment - Follow These Steps

### Prerequisites
- ✅ Python 3.11+ installed
- ✅ PostgreSQL  15+ installed and running
- ✅ Git installed

---

## 🎯 Option 1: Automated Setup (Recommended)

### Step 1: Setup Backend (5 minutes)
```powershell
cd backend
.\start_backend.ps1
```

This script will automatically:
- Create virtual environment
- Install all dependencies
- Check database connection
- Run migrations
- Seed database (optional)
- Start server on port 8000

### Step 2: Start Frontend (1 minute)
```powershell
# New terminal window
.\start_frontend.ps1
```

### Step 3: Open Browser
```
http://localhost:5500
```

---

## 🎯 Option 2: Manual Setup

### Backend Setup

```powershell
# 1. Navigate to backend
cd backend

# 2. Create .env file
copy .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Create virtual environment
python -m venv venv

# 4. Activate environment
.\venv\Scripts\Activate.ps1

# 5. Install dependencies
pip install -r requirements.txt

# 6. Run migrations
alembic upgrade head

# 7. Seed database
python scripts/seed_db.py

# 8. Start server
uvicorn app.main:app --reload
```

### Frontend Setup

```powershell
# New terminal
cd d:\cybersecurity-club-apsit-Shubham
python -m http.server 5500
```

### Open Browser
```
http://localhost:5500
```

---

## ✅ Verify It's Working

### Quick Test
```powershell
cd backend
python test_connectivity.py
```

**Expected Result:** 6/6 tests passed ✅

### Manual Checks
1. Open http://localhost:5500 - should load without errors
2. Check browser console (F12) - no CORS errors
3. Events section should show events
4. Click "Admin Login" - login with `admin` / `admin123`

---

## 🔐 Default Credentials

After seeding:
- **Username:** `admin`
- **Password:** `admin123`

⚠️ **CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!**

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Make sure backend is running on port 8000
- Check: http://localhost:8000/health

### "Database connection failed"
- PostgreSQL is running?
- `.env` DATABASE_URL is correct?
- Database exists? Run: `CREATE DATABASE cybersec_club;`

### "Module not found"
- Run: `pip install -r requirements.txt`

### "Port already in use"
- Stop other services or change port

### CORS Errors
- Check `ALLOWED_ORIGINS` in `.env`
- Restart backend after changes

---

## 📁 Project Structure

```
cybersecurity-club-apsit-Shubham/
├── backend/                    # FastAPI backend
│   ├── app/                   # Application code
│   ├── .env                   # Environment config (create this!)
│   ├── requirements.txt       # Python dependencies
│   ├── start_backend.ps1      # Automated setup script
│   └── test_connectivity.py   # Connection test
├── js/                        # Frontend JavaScript
│   └── api.js                # API service
├── index.html                 # Main frontend file
├── start_frontend.ps1         # Frontend start script
└── SETUP_GUIDE.md            # Detailed documentation
```

---

## 🚀 Production Deployment

See `pre_deployment_checklist.md` for complete deployment guide.

Quick points:
1. Set `DEBUG=False` in `.env`
2. Update `ALLOWED_ORIGINS` to production domain
3. Generate new `JWT_SECRET_KEY`
4. Use HTTPS
5. Change default password

---

## 📚 Documentation

- **Setup Guide:** `SETUP_GUIDE.md` - Complete setup instructions
- **Deployment Checklist:** `pre_deployment_checklist.md` - Pre-deployment guide
- **Connectivity Audit:** `connectivity_audit_report.md` - Technical details
- **API Docs:** http://localhost:8000/docs (when backend running)

---

## 💡 Key Files to Configure

### Backend
- `backend/.env` - Main configuration (DATABASE_URL, JWT_SECRET_KEY, CORS)
- `backend/app/config.py` - Default settings

### Frontend  
- `index.html` - Update `window.API_CONFIG.baseURL` for production

---

## ✅ All Fixed Issues

- ✅ CORS configuration (port 5500)
- ✅ Security headers (CSP allows CDN)
- ✅ API timeout support
- ✅ Better error handling
- ✅ Debug logging
- ✅ Secure authentication
- ✅ Environment template
- ✅ Automated setup scripts

---

## 🆘 Need Help?

1. Run `test_connectivity.py` to diagnose
2. Check browser console for errors
3. Check backend terminal for errors
4. Review `SETUP_GUIDE.md`

---

## 🎉 Ready for Deployment!

All connectivity issues have been fixed. Your application is ready for tomorrow's deployment!

**Quick Start Commands:**
```powershell
# Terminal 1
cd backend
.\start_backend.ps1

# Terminal 2  
.\start_frontend.ps1

# Browser
# Open: http://localhost:5500
```

Good luck! 🚀
