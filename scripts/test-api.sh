#!/bin/bash

# Скрипт для тестирования User Service API

echo "🧪 Тестирование User Service API"
echo "================================"

BASE_URL="http://localhost:8080"

# Тест 1: Health Check
echo "1. Тестируем /health"
curl -s "$BASE_URL/health" | jq .
echo ""

# Тест 2: Login
echo "2. Тестируем /login"
curl -s "$BASE_URL/login" | jq .
echo ""

# Тест 3: Callback (создание пользователя)
echo "3. Тестируем /callback (создание тестового пользователя)"
RESPONSE=$(curl -s "$BASE_URL/callback?code=test123")
echo "$RESPONSE" | jq .

# Извлекаем токены
ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$RESPONSE" | jq -r '.refresh_token')

echo ""
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
echo ""

# Тест 4: Получение информации о пользователе
echo "4. Тестируем /me"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "$BASE_URL/me" | jq .
echo ""

# Тест 5: Обновление токена
echo "5. Тестируем /refresh"
curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH_TOKEN\"}" \
  "$BASE_URL/refresh" | jq .
echo ""

# Тест 6: Получение списка пользователей (требует админ права)
echo "6. Тестируем /admin/users (должен вернуть 403, так как пользователь не админ)"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" "$BASE_URL/admin/users" | jq .
echo ""

echo "✅ Тестирование завершено!"
