#!/bin/bash

# Скрипт для запуска user-service

echo "🚀 Запуск User Service..."

# Проверяем наличие config.env
if [ ! -f "config.env" ]; then
    echo "❌ Файл config.env не найден!"
    echo "📝 Создайте файл config.env на основе config.env.example"
    exit 1
fi

# Загружаем переменные окружения
export $(cat config.env | grep -v '^#' | xargs)

# Проверяем обязательные переменные
if [ -z "$DISCORD_CLIENT_ID" ] || [ -z "$DISCORD_CLIENT_SECRET" ] || [ -z "$JWT_SECRET" ]; then
    echo "❌ Не все обязательные переменные настроены в config.env!"
    echo "📝 Убедитесь, что установлены: DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, JWT_SECRET"
    exit 1
fi

echo "✅ Конфигурация загружена"
echo "🌐 Сервер будет доступен на http://localhost:${SERVER_PORT:-8080}"
echo ""

# Запускаем сервер
go run main.go
