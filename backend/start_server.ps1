# Cybersecurity Club Backend - Server Startup Script
# This script will start the backend server properly

Write-Host "🚀 Starting Cybersecurity Club Backend Server" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Check if Docker is running
Write-Host "`n📦 Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
Write-Host "`n🔧 Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "✗ .env file not found. Creating from template..." -ForegroundColor Red
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file from template" -ForegroundColor Green
    Write-Host "⚠️  Please review and update .env file if needed" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file exists" -ForegroundColor Green
}

# Stop any existing containers
Write-Host "`n🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down
Write-Host "✓ Stopped existing containers" -ForegroundColor Green

# Build and start services
Write-Host "`n🏗️  Building and starting services..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Gray
docker-compose up -d --build

# Wait for database to be ready
Write-Host "`n⏳ Waiting for database to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$dbReady = $false

while ($attempt -lt $maxAttempts -and -not $dbReady) {
    $attempt++
    $health = docker inspect --format='{{.State.Health.Status}}' cybersec_db 2>$null
    if ($health -eq "healthy") {
        $dbReady = $true
        Write-Host "✓ Database is ready!" -ForegroundColor Green
    } else {
        Write-Host "  Waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $dbReady) {
    Write-Host "✗ Database failed to start. Check logs with: docker-compose logs db" -ForegroundColor Red
    exit 1
}

# Wait for backend to be ready
Write-Host "`n⏳ Waiting for backend to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✓ Backend is ready!" -ForegroundColor Green
        }
    } catch {
        Write-Host "  Waiting... ($attempt/$maxAttempts)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $backendReady) {
    Write-Host "✗ Backend failed to start. Check logs with: docker-compose logs backend" -ForegroundColor Red
    Write-Host "`nShowing recent backend logs:" -ForegroundColor Yellow
    docker-compose logs --tail=20 backend
    exit 1
}

# Check if database needs seeding
Write-Host "`n🌱 Checking database..." -ForegroundColor Yellow
$needsSeeding = $true

try {
    # Try to login with default credentials to check if admin exists
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue

    if ($response.StatusCode -eq 200) {
        $needsSeeding = $false
        Write-Host "✓ Database already seeded" -ForegroundColor Green
    }
} catch {
    # Admin doesn't exist or credentials are wrong
}

if ($needsSeeding) {
    Write-Host "⚠️  Database needs seeding. Running seed script..." -ForegroundColor Yellow
    docker-compose exec -T backend python scripts/seed_db.py
    Write-Host "✓ Database seeded successfully" -ForegroundColor Green
}

# Display status
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "✅ SERVER IS READY!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Gray

Write-Host "`n📍 Access Points:" -ForegroundColor Cyan
Write-Host "  • API Health:     http://localhost:8000/health" -ForegroundColor White
Write-Host "  • API Docs:       http://localhost:8000/docs" -ForegroundColor White
Write-Host "  • API Root:       http://localhost:8000" -ForegroundColor White

Write-Host "`n🔐 Default Admin Credentials:" -ForegroundColor Cyan
Write-Host "  • Username:       admin" -ForegroundColor White
Write-Host "  • Password:       admin123" -ForegroundColor White
Write-Host "  ⚠️  Change password after first login!" -ForegroundColor Yellow

Write-Host "`n📊 Useful Commands:" -ForegroundColor Cyan
Write-Host "  • View logs:      docker-compose logs -f" -ForegroundColor White
Write-Host "  • Stop server:    docker-compose down" -ForegroundColor White
Write-Host "  • Restart:        docker-compose restart" -ForegroundColor White
Write-Host "  • View status:    docker-compose ps" -ForegroundColor White

Write-Host "`n🧪 Testing Admin Login:" -ForegroundColor Cyan
Write-Host "  • Open browser:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "  • Or test with:   python test_connectivity.py" -ForegroundColor White

Write-Host "`n✨ Server is running and ready for admin login!" -ForegroundColor Green
Write-Host ""
