# Скрипт для тестирования Auth Service API (PowerShell)

Write-Host "🧪 Тестирование Auth Service API" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

$BASE_URL = "http://localhost:8080"

# Тест 1: Health Check
Write-Host "`n1. Тестируем /health" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Тест 2: Login
Write-Host "`n2. Тестируем /login" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/login" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Тест 3: Callback (создание пользователя)
Write-Host "`n3. Тестируем /callback (создание тестового пользователя)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/callback?code=test123" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content: $($response.Content)" -ForegroundColor White
    
    # Парсим JSON ответ
    $json = $response.Content | ConvertFrom-Json
    $ACCESS_TOKEN = $json.access_token
    $REFRESH_TOKEN = $json.refresh_token
    
    Write-Host "`nAccess Token: $($ACCESS_TOKEN.Substring(0, 50))..." -ForegroundColor Cyan
    Write-Host "Refresh Token: $($REFRESH_TOKEN.Substring(0, 50))..." -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Тест 4: Получение информации о пользователе
Write-Host "`n4. Тестируем /me" -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $ACCESS_TOKEN" }
    $response = Invoke-WebRequest -Uri "$BASE_URL/me" -Headers $headers -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Тест 5: Обновление токена
Write-Host "`n5. Тестируем /refresh" -ForegroundColor Yellow
try {
    $body = @{ refresh_token = $REFRESH_TOKEN } | ConvertTo-Json
    $headers = @{ "Content-Type" = "application/json" }
    $response = Invoke-WebRequest -Uri "$BASE_URL/refresh" -Method POST -Body $body -Headers $headers -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Тест 6: Получение списка пользователей (требует админ права)
Write-Host "`n6. Тестируем /admin/users (должен вернуть 403, так как пользователь не админ)" -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $ACCESS_TOKEN" }
    $response = Invoke-WebRequest -Uri "$BASE_URL/admin/users" -Headers $headers -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Тестирование завершено!" -ForegroundColor Green
