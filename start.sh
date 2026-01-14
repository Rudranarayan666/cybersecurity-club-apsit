#!/bin/bash

# Cybersecurity Club Website - Startup Script

set -e

echo "🔒 Starting Cybersecurity Club Website..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# === START POSTGRESQL ===
echo -e "${BLUE}[1/3]${NC} Starting PostgreSQL..."
if brew services list | grep -q "postgresql@15"; then
    if brew services list | grep "postgresql@15" | grep -q "stopped"; then
        brew services start postgresql@15
        sleep 2
        echo -e "${GREEN}✓${NC} PostgreSQL started"
    else
        echo -e "${GREEN}✓${NC} PostgreSQL already running"
    fi
else
    echo -e "${YELLOW}⚠${NC} PostgreSQL not installed. Install with: brew install postgresql@15"
    exit 1
fi

# === START BACKEND ===
echo -e "${BLUE}[2/3]${NC} Starting FastAPI Backend..."
cd "$SCRIPT_DIR/backend"

# Check if venv exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate venv
source .venv/bin/activate

# Install requirements if needed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Installing Python dependencies..."
    pip install -q -r requirements.txt
fi

# Start backend
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"
else
    echo -e "${YELLOW}⚠${NC} Backend failed to start. Check /tmp/backend.log"
    cat /tmp/backend.log
    exit 1
fi

# === START FRONTEND ===
echo -e "${BLUE}[3/3]${NC} Starting Frontend HTTP Server..."
cd "$SCRIPT_DIR"

# Kill any existing http.server on port 5500
pkill -f "http.server.*5500" 2>/dev/null || true
sleep 1

# Start frontend
nohup python3 -m http.server 5500 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 1

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"
else
    echo -e "${YELLOW}⚠${NC} Frontend failed to start"
    exit 1
fi

# === DISPLAY INFORMATION ===
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ System is running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Frontend:${NC}  http://localhost:5500"
echo -e "${BLUE}Backend:${NC}   http://localhost:8000"
echo -e "${BLUE}API Docs:${NC}  http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Admin Credentials:${NC}"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# === WAIT FOR TERMINATION ===
wait
