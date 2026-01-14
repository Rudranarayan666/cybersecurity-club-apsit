# Quick Status Check for Cybersecurity Club Backend

Write-Host "🔍 Cybersecurity Club Backend Status Check" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Check Docker containers
Write-Host "`n📦 Docker Containers:" -ForegroundColor Yellow
docker-compose ps

# Check database health
Write-Host "`n🗄️  Database Health:" -ForegroundColor Yellow
$dbHealth = docker inspect --format='{{.State.Health.Status}}' cybersec_db 2>$null
if ($dbHealth -eq "healthy") {
    Write-Host "  ✓ Database: HEALTHY" -ForegroundColor Green
}
elseif ($dbHealth -eq "unhealthy") {
    Write-Host "  ✗ Database: UNHEALTHY" -ForegroundColor Red
}
elseif ($dbHealth -eq "starting") {
    Write-Host "  ⏳ Database: STARTING" -ForegroundColor Yellow
}
else {
    Write-Host "  ✗ Database: NOT RUNNING" -ForegroundColor Red
}

# Check backend health
Write-Host "`n⚙️  Backend API:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -TimeoutSec 3 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ API: RUNNING" -ForegroundColor Green
        Write-Host "  ✓ URL: http://localhost:8001" -ForegroundColor Green
    }
}
catch {
    Write-Host "  ✗ API: NOT ACCESSIBLE" -ForegroundColor Red
    Write-Host "  ✗ Check logs with: docker-compose logs backend" -ForegroundColor Red
}

# Test admin login
Write-Host "`n🔐 Admin Login Test:" -ForegroundColor Yellow
try {
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:8001/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -UseBasicParsing `
        -ErrorAction Stop

    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Admin login: WORKING" -ForegroundColor Green
        $token = ($response.Content | ConvertFrom-Json).access_token
        Write-Host "  ✓ JWT token generated successfully" -ForegroundColor Green
    }
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "  ⚠️  Admin login: Credentials incorrect or user not seeded" -ForegroundColor Yellow
        Write-Host "  💡 Run: docker-compose exec backend python scripts/seed_db.py" -ForegroundColor Cyan
    }
    else {
        Write-Host "  ✗ Admin login: FAILED (HTTP $statusCode)" -ForegroundColor Red
    }
}

# Show recent logs
Write-Host "`n📋 Recent Backend Logs (last 10 lines):" -ForegroundColor Yellow
docker-compose logs --tail=10 backend

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "Tip: Run './start_server.ps1' to start/restart the server" -ForegroundColor Cyan
Write-Host ""
