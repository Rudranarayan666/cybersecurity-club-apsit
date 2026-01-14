# Cybersecurity Club Website - Integration Guide

## System Architecture

The website is now fully integrated with the FastAPI backend. Here's how everything works:

### Components

1. **Frontend** (HTML/CSS/JavaScript)
   - Running on: `http://localhost:5500`
   - Main file: `index.html`
   - API communication: `js/api.js`

2. **Backend** (FastAPI + PostgreSQL)
   - Running on: `http://localhost:8000`
   - API Base URL: `http://localhost:8000/api`
   - Database: PostgreSQL (localhost:5432)

---

## API Integration

### Authentication

**Login Endpoint:** `POST /api/auth/login`
- Credentials:
  - Username: `admin`
  - Password: `admin123`
- Returns JWT token stored in `localStorage`

**Frontend Implementation:**
```javascript
// In js/api.js - APIService class
async login(username, password) {
    return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}
```

---

## Features & Endpoints

### 1. Events Management

**Get All Events**
```
GET /api/events
```
- Displays upcoming and past events
- Frontend auto-loads on page load via `loadDataFromBackend()`

**Create Event (Admin Only)**
```
POST /api/events
Headers: Authorization: Bearer {token}
Body: {
    "title": "Event Title",
    "type": "WORKSHOP|HACKATHON|SEMINAR|BOOTCAMP|LECTURE",
    "date": "2026-02-15",
    "description": "Event description"
}
```
- Triggered by: Admin modal form → `handleAdminCreate()`

### 2. Event Registration (Public)

**Register for Event**
```
POST /api/registrations
Body: {
    "event_id": "uuid",
    "operative_name": "Student Name",
    "moodle_id": "12345678"  // 8-12 alphanumeric chars
}
```
- Duplicate prevention: One Moodle ID per event
- Triggered by: Event registration modal → `handleModalSubmit()`

### 3. Resources Library

**Get Resources**
```
GET /api/resources?level=BEGINNER|INTERMEDIATE|ADVANCED
```
- Displays PDF resources by difficulty level
- Filter buttons update view via `filterResources(level)`

**Download Resource**
```
GET /api/resources/{resource_id}/download
```
- Directly downloads PDF file
- Triggered by: Download button → `downloadResourceFile()`

---

## How Frontend Connects to Backend

### 1. **API Service Layer** (`js/api.js`)

All API calls go through the `APIService` class:
- Handles authentication tokens
- Manages HTTP requests
- Error handling
- URL construction

```javascript
const apiService = new APIService();

// Usage in frontend
const result = await apiService.getEvents();
const result = await apiService.login(username, password);
const result = await apiService.registerForEvent(eventId, name, moodleId);
```

### 2. **Data Loading on Page Load**

```javascript
async function loadDataFromBackend() {
    // Load events from API
    const eventsResult = await apiService.getEvents();
    if (eventsResult.success) {
        events = eventsResult.data.map(/* transform data */);
    }
    
    // Load resources
    const resourcesResult = await apiService.getResources();
    if (resourcesResult.success) {
        resources = resourcesResult.data;
    }
}
```

### 3. **Form Handling**

All forms now make real API calls:

**Login Form:**
- Takes username/password
- Calls `apiService.login()`
- Stores JWT token on success
- Shows success/error toast

**Registration Form:**
- Validates Moodle ID (8-12 alphanumeric)
- Calls `apiService.registerForEvent()`
- Prevents duplicate registrations automatically

**Admin Event Creation:**
- Protected by password check
- Requires valid JWT token
- Calls `apiService.createEvent()`

---

## Testing the Integration

### Test 1: View Events
1. Open `http://localhost:5500`
2. Scroll to "Club Events" section
3. Should see 3 seeded events:
   - Web Security Workshop (upcoming)
   - Malware Analysis Bootcamp (upcoming)
   - Introduction to Cryptography (past)

### Test 2: Admin Login
1. Click "Login" button (top-right)
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Authenticate"
4. Success notification should appear
5. Token stored in `localStorage['authToken']`

### Test 3: Register for Event
1. In "Club Events" section, click "Register" on an event
2. Fill form:
   - Name: Your name
   - Moodle ID: 12345678
3. Click "Confirm Registration"
4. Success notification appears
5. Try registering again with same Moodle ID → should get error

### Test 4: Admin Create Event
1. First, login as admin (Test 2)
2. Click fingerprint icon (next to Login button)
3. Enter password: `cyber@123`
4. Modal appears to create new event
5. Fill details and upload

### Test 5: Download Resources
1. Scroll to "Resource Library"
2. Click "Download" on any resource
3. PDF should download to your computer

---

## Database Schema

### Users
- `id` (UUID, PK)
- `username` (unique, 3-50 chars)
- `password_hash` (Argon2)
- `is_active` (boolean)
- `created_at`, `last_login`

### Events
- `id` (UUID, PK)
- `title`, `type` (ENUM), `date`
- `description`, `is_active`
- `created_at`, `updated_at`

### Registrations
- `id` (UUID, PK)
- `event_id` (FK to Events)
- `operative_name`, `moodle_id`
- `timestamp`
- **Unique constraint:** (event_id, moodle_id)

### Resources
- `id` (UUID, PK)
- `title`, `level` (ENUM: BEGINNER/INTERMEDIATE/ADVANCED)
- `file_url`, `file_size`
- `created_at`, `updated_at`

---

## CORS Configuration

The backend allows requests from:
- `http://localhost:3000`
- `http://localhost:5500`
- `http://127.0.0.1:5500`
- `http://localhost`

Modify `backend/.env` if you need different origins.

---

## Error Handling

### Frontend Toast Notifications

```javascript
showToast(message, type); // type: 'success' or 'error'

// Examples
showToast("Login successful", "success");
showToast("Invalid credentials", "error");
```

### API Error Response Structure

```javascript
{
    success: false,
    error: "Error message",
    status: 400,
    data: { /* detailed error info */ }
}
```

---

## Authentication Flow

```
1. User enters credentials in login form
   ↓
2. Frontend calls apiService.login(username, password)
   ↓
3. Backend validates and returns JWT token
   ↓
4. Frontend stores token in localStorage
   ↓
5. Token automatically added to all protected requests
   ↓
6. Backend validates token and authorizes request
```

---

## Running the System

### Start PostgreSQL
```bash
brew services start postgresql@15
```

### Start Backend
```bash
cd backend
PYTHONPATH=. /path/to/venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Start Frontend
```bash
python3 -m http.server 5500
```

---

## File Structure

```
cybersecurity-club-apsit-Shubham/
├── index.html                 # Main frontend
├── js/
│   ├── api.js                 # API service layer
│   └── auth.js                # Additional auth utilities
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── api/
│   │   │   ├── auth.py        # Auth endpoints
│   │   │   ├── events.py      # Events endpoints
│   │   │   ├── registrations.py # Registrations
│   │   │   └── resources.py   # Resources endpoints
│   │   └── middleware/        # CORS, rate limiting, etc.
│   ├── scripts/
│   │   └── seed_db.py         # Initialize test data
│   └── .env                   # Configuration
```

---

## Security Features

1. **JWT Authentication**
   - Tokens expire after 1 hour
   - Secure password hashing (Argon2)

2. **Rate Limiting**
   - Login: 5 attempts per 15 minutes

3. **Input Validation**
   - Sanitization of user inputs
   - Email validation
   - Moodle ID format validation

4. **CORS Protection**
   - Whitelisted origins only
   - Credentials support

---

## Troubleshooting

### Backend not responding
```bash
# Check if running
lsof -i :8000

# Restart
pkill -f uvicorn
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Database connection error
```bash
# Check PostgreSQL
brew services list

# Restart
brew services restart postgresql@15
```

### CORS errors in browser console
- Add the frontend URL to `ALLOWED_ORIGINS` in `.env`
- Restart backend

### Login failing
- Verify admin user exists:
  ```bash
  psql -U cybersec_user -d cybersec_club -c "SELECT * FROM users;"
  ```
- Reseed database if needed:
  ```bash
  python scripts/seed_db.py
  ```

---

## Next Steps

1. Change admin password (default: admin123)
2. Add more seed events/resources
3. Upload actual PDF files for resources
4. Configure email notifications
5. Deploy to production server

---

*Last Updated: January 13, 2026*
