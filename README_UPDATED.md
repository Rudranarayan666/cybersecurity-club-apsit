# ✨ Cybersecurity Club APSIT - Website

> A modern, secure, fully-functional website for the APSIT Cybersecurity Club with event management, registration system, and resource library.

## 🚀 Quick Start

### Prerequisites
- **macOS** with Homebrew
- **Python 3.11+**
- **PostgreSQL 15+**
- **Modern web browser** (Chrome, Firefox, Safari)

### Installation & Running

**Option 1: Automatic (Recommended)**
```bash
cd cybersecurity-club-apsit-Shubham
chmod +x start.sh
./start.sh
```

**Option 2: Manual**

1. **Start PostgreSQL**
```bash
brew services start postgresql@15
```

2. **Start Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

3. **Start Frontend** (new terminal)
```bash
python3 -m http.server 5500
```

### Access the Website
- **Website**: http://localhost:5500
- **API Docs**: http://localhost:8000/docs
- **Admin Login**: `admin` / `admin123`

---

## 📋 Features

### ✅ Fully Implemented

- **👤 Admin Authentication**
  - JWT-based login system
  - Secure password hashing (Argon2)
  - Session management

- **📅 Event Management**
  - View all events (upcoming & past)
  - Admin can create/edit/delete events
  - Event registration with duplicate prevention
  - Real-time synchronization with database

- **🎫 Registration System**
  - Public event registration
  - Moodle ID validation
  - Prevents duplicate registrations per student
  - Email confirmation (database ready)

- **📚 Resource Library**
  - PDF upload/download system
  - Filter by difficulty level (Beginner, Intermediate, Advanced)
  - Download resources directly
  - Admin management

- **🎨 Beautiful UI**
  - Dark/Light mode toggle
  - 3D animations with Three.js
  - Responsive design
  - Glassmorphic components
  - Smooth transitions

- **🔒 Security**
  - CORS protection
  - Rate limiting on login (5 attempts/15 min)
  - Input sanitization
  - XSS prevention
  - Security headers

---

## 🔌 Frontend-Backend Connection

### How It Works

1. **Frontend** (`index.html` + `js/api.js`)
   - All API calls go through `APIService` class
   - Automatic token management
   - Error handling with user feedback

2. **Backend** (FastAPI + PostgreSQL)
   - RESTful API endpoints
   - JWT authentication
   - Database persistence
   - Input validation

3. **Data Flow**
```
User Action → Frontend Form → APIService → Backend API → Database → Response → UI Update
```

### Example: Event Registration

```javascript
// Frontend
async function handleModalSubmit(e) {
    const name = e.target.querySelector('input').value;
    const moodleId = e.target.querySelectorAll('input')[1].value;
    
    // Call API
    const result = await apiService.registerForEvent(eventId, name, moodleId);
    
    if (result.success) {
        showToast("Registration successful", "success");
    } else {
        showToast(result.error, "error");
    }
}
```

```python
# Backend
@router.post("/registrations")
def create_registration(registration_data: RegistrationCreate, db: Session = Depends(get_db)):
    # Validate and save to database
    registration = Registration(...)
    db.add(registration)
    db.commit()
    return registration
```

---

## 📁 Project Structure

```
cybersecurity-club-apsit-Shubham/
├── index.html                      # Main website
├── js/
│   └── api.js                      # API service layer ⭐ KEY FILE
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app
│   │   ├── models.py               # Database models
│   │   ├── schemas.py              # Request/response schemas
│   │   ├── config.py               # Configuration
│   │   ├── security.py             # JWT & password handling
│   │   ├── api/
│   │   │   ├── auth.py             # Login endpoint
│   │   │   ├── events.py           # Event CRUD
│   │   │   ├── registrations.py    # Registration CRUD
│   │   │   └── resources.py        # Resource management
│   │   └── middleware/
│   │       ├── cors.py             # CORS setup
│   │       ├── rate_limit.py       # Rate limiting
│   │       └── security_headers.py # Security headers
│   ├── scripts/
│   │   └── seed_db.py              # Initialize test data
│   ├── .env                        # Configuration
│   └── requirements.txt            # Python dependencies
├── start.sh                        # Quick start script
├── stop.sh                         # Stop script
├── INTEGRATION_GUIDE.md            # Detailed integration docs
└── README.md                       # This file
```

---

## 🧪 Testing

### Test Admin Login
```bash
# Terminal 1: Frontend already running

# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Event Retrieval
```bash
# Get all events
curl http://localhost:8000/api/events

# Get resources
curl http://localhost:8000/api/resources
```

### Manual Testing
1. Open http://localhost:5500
2. Click "Login" → Enter admin credentials
3. Scroll to "Club Events" → Register for an event
4. Check "Resource Library" → Download a resource
5. Click fingerprint icon → Create a new event

---

## 🔐 Admin Credentials

**Default Admin User** (created by `seed_db.py`):
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change these credentials after first login!

---

## 📊 Database Schema

### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    last_login TIMESTAMP
);
```

### Events
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type ENUM('WORKSHOP', 'HACKATHON', 'SEMINAR', 'BOOTCAMP', 'LECTURE'),
    date DATE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Registrations
```sql
CREATE TABLE registrations (
    id UUID PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id),
    operative_name VARCHAR(100) NOT NULL,
    moodle_id VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    UNIQUE(event_id, moodle_id)  -- Prevent duplicate registrations
);
```

### Resources
```sql
CREATE TABLE resources (
    id UUID PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

---

## 🛠 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user info

### Events
- `GET /api/events` - List all events
- `GET /api/events/{event_id}` - Get single event
- `POST /api/events` - Create event (admin)
- `PUT /api/events/{event_id}` - Update event (admin)
- `DELETE /api/events/{event_id}` - Delete event (admin)

### Registrations
- `POST /api/registrations` - Register for event (public)
- `GET /api/registrations` - List registrations (admin)
- `GET /api/registrations?export=csv` - Export as CSV (admin)

### Resources
- `GET /api/resources` - List resources
- `GET /api/resources/{resource_id}` - Get single resource
- `GET /api/resources/{resource_id}/download` - Download PDF
- `POST /api/resources` - Upload resource (admin)
- `DELETE /api/resources/{resource_id}` - Delete resource (admin)

**Authentication**: Most endpoints require JWT token in header:
```
Authorization: Bearer {token}
```

---

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill existing process
pkill -f uvicorn

# Restart
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Database connection error
```bash
# Check PostgreSQL status
brew services list

# Start PostgreSQL
brew services start postgresql@15

# Create database if needed
/opt/homebrew/opt/postgresql@15/bin/psql postgres -c "CREATE DATABASE cybersec_club OWNER cybersec_user;"
```

### API returning 500 errors
```bash
# Check backend logs
tail -f /tmp/backend.log

# Reinitialize database
cd backend && python scripts/seed_db.py
```

### CORS errors in browser
- Frontend and backend must have compatible CORS settings
- Check `backend/app/middleware/cors.py`
- Update `ALLOWED_ORIGINS` in `.env` if needed

---

## 📝 Configuration

Edit `backend/.env`:
```ini
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# JWT
JWT_SECRET_KEY=your-secret-key-min-32-chars
JWT_EXPIRATION_SECONDS=3600

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

---

## 🔄 Data Flow Example

### User Registers for Event

```
1. User fills registration form in browser
   └─ Name: "John Doe"
   └─ Moodle ID: "12345678"
   └─ Event: "Web Security Workshop"

2. Frontend calls API:
   POST /api/registrations
   {
     "event_id": "5edde0dd-597c-4923-a2df-228a7d5e25b8",
     "operative_name": "John Doe",
     "moodle_id": "12345678"
   }

3. Backend processes:
   └─ Validates input (Moodle ID format, length, etc.)
   └─ Checks if event exists and is active
   └─ Checks for duplicate registration
   └─ Saves to database

4. Database stores:
   INSERT INTO registrations (id, event_id, operative_name, moodle_id, timestamp)
   VALUES (uuid, event_id, 'John Doe', '12345678', now())

5. Backend returns:
   {
     "id": "uuid",
     "event_id": "uuid",
     "operative_name": "John Doe",
     "moodle_id": "12345678",
     "timestamp": "2026-01-13T21:30:00"
   }

6. Frontend shows success:
   showToast("Registration Successful", "success")
```

---

## 🚀 Deployment

To deploy to production:

1. **Change admin password**
   ```python
   # In backend
   python
   >>> from app.security import hash_password
   >>> hash_password("new_secure_password")
   ```

2. **Update `.env`**
   ```ini
   DEBUG=False
   JWT_SECRET_KEY=<generate-new-random-key>
   ALLOWED_ORIGINS=yourdomain.com,www.yourdomain.com
   ```

3. **Use production server**
   ```bash
   gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
   ```

4. **Set up SSL/TLS**
   - Use Let's Encrypt certificates
   - Configure Nginx/Apache reverse proxy

5. **Database**
   - Use managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
   - Enable backups
   - Set up monitoring

---

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Pydantic Validation](https://docs.pydantic.dev/)
- [JWT Guide](https://jwt.io/)
- [OWASP Security](https://owasp.org/)

---

## 📄 License

This project is maintained by the Cybersecurity Club APSIT.

---

## 💬 Support

For issues or questions:
- Check `INTEGRATION_GUIDE.md` for detailed integration docs
- Review API documentation at `http://localhost:8000/docs`
- Check backend logs: `tail -f /tmp/backend.log`

---

## ✅ Checklist

- [x] Frontend-Backend API integration
- [x] Authentication system
- [x] Event management (CRUD)
- [x] Event registration system
- [x] Resource library
- [x] Admin dashboard
- [x] Error handling
- [x] Input validation
- [x] Rate limiting
- [x] CORS protection
- [x] Database seeding
- [x] Documentation

---

**Last Updated**: January 13, 2026  
**Status**: ✅ Fully Functional & Ready to Use
