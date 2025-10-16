@echo off
echo 🚀 Запуск User Service...

REM Проверяем наличие config.env
if not exist "config.env" (
    echo ❌ Файл config.env не найден!
    echo 📝 Создайте файл config.env на основе config.env.example
    pause
    exit /b 1
)

echo ✅ Конфигурация найдена
echo 🌐 Сервер будет доступен на http://localhost:8080
echo.

REM Запускаем сервер
go run main.go

pause
