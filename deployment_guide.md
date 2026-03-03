# Deployment Guide: Cybersecurity Club

This guide explains how to deploy the APSIT Cybersecurity Club full-stack application on a fresh Linux server.

## Prerequisites

- **Docker** and **Docker Compose** installed.
- **Git** installed.
- A **Domain Name** (for SSL/TLS via Nginx).

## 1. Initial Setup

Clone the repository and move to the project root:
```bash
git clone <your-repo-url>
cd cybersecurity-club-apsit-main
```

## 2. Environment Configuration

Copy the example environment file and update it with **secure production values**:
```bash
cp .env.example .env
nano .env
```

**Crucial Steps:**
1. Generate a secure `JWT_SECRET_KEY`:
   `python -c "import secrets; print(secrets.token_urlsafe(32))"`
2. Set `DEBUG=false`.
3. Update `ALLOWED_ORIGINS` to your production domain(s).
4. Change `ADMIN_PASSWORD` from the default.

## 3. High-Security Deployment (Docker)

Run the entire system in the background using Docker Compose:
```bash
docker-compose up -d --build
```

This command will:
- Initialize the **PostgreSQL** database.
- Build and start the **FastAPI** backend (on port 8000).
- Build the **Vite/React** frontend and serve it via **Nginx** (on port 5173 by default, can be mapped to 80).
- Setup **Grafana** monitoring (on port 3000).

## 4. Production Nginx & SSL (Recommended)

For real deployment, use a reverse proxy (like the one provided in the `backend/nginx.conf` template) to handle HTTPS (Port 443) and map it to the `frontend` container.

**Steps:**
1. Point your domain A-record to the server IP.
2. Ensure ports 80 and 443 are open in the firewall.
3. Update `backend/nginx.conf` with your domain.
4. Restart Nginx to pick up Certbot certificates.

## 5. First-Time Database Seeding

The Docker setup automatically runs migrations and seeds the admin user on the first start. You can manually run seeds if needed:
```bash
docker-compose exec backend python scripts/seed_db.py
```
