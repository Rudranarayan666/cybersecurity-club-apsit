# 🚀 Fresh System Setup Guide

Follow these steps to run the project on a completely new machine.

## Prerequisites
1.  **Docker Desktop** (Installed and running)
2.  **Git**
3.  **Python 3.11+**

## Step 1: Clone the Repository
```powershell
git clone <your-repo-url>
cd cybersecurity-club-apsit
```

## Step 2: Backend Setup
1.  Navigate to the backend directory:
    ```powershell
    cd backend
    ```
2.  Create the `.env` file from the example:
    ```powershell
    copy .env.example .env
    ```
3.  **Important**: Open `.env` and set `DEBUG=False` to ensure smooth database migrations.
4.  Start the backend services (this handles database creation, migrations, and seeding automatically):
    ```powershell
    docker-compose up -d --build
    ```
    *Wait for about 1-2 minutes for the database to initialize and seed.*

## Step 3: Frontend Setup
1.  Navigate back to the root directory:
    ```powershell
    cd ..
    ```
2.  Create the frontend `.env` file:
    ```powershell
    # Windows PowerShell
    New-Item .env -Value "API_BASE_URL=http://localhost:8001/api`nFRONTEND_PORT=5500"
    ```
    *(Or manually create a file named `.env` and add the lines above)*

3.  Start the frontend:
    ```powershell
    .\start_frontend.ps1
    ```

## ✅ Done!
- **Frontend**: [http://localhost:5500](http://localhost:5500)
- **Backend API**: [http://localhost:8001/docs](http://localhost:8001/docs)
- **Admin Login**: `admin` / `admin123`
