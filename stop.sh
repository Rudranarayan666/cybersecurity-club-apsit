#!/bin/bash

# Cybersecurity Club Website - Stop Script

echo "🛑 Stopping Cybersecurity Club Website..."

# Kill backend
echo "Stopping Backend..."
pkill -f "uvicorn app.main" || echo "Backend not running"

# Kill frontend
echo "Stopping Frontend..."
pkill -f "http.server.*5500" || echo "Frontend not running"

sleep 1

echo "✓ All services stopped"
