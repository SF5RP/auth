# 📋 Шпаргалка с командами

Все команды для быстрого запуска проекта в одном месте.

## 🚀 Первый запуск

### 1. Установите зависимости Backend

```bash
go mod tidy
```

### 2. Настройте переменные окружения

Отредактируйте `config.env`:

```bash
# Windows
notepad config.env

# Linux/Mac
nano config.env
# или
vim config.env
```

Обязательно укажите:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `JWT_SECRET`

### 3. Запустите базу данных

#### Через Docker (рекомендуется):

```bash
docker-compose up -d db
```

#### Или локально в PostgreSQL:

```sql
CREATE DATABASE authdb;
CREATE USER auth WITH PASSWORD 'authpassword';
GRANT ALL PRIVILEGES ON DATABASE authdb TO auth;
```

### 4. Примените миграции

```bash
go run cmd/migrator/main.go up
```

### 5. Запустите Backend

```bash
go run main.go
```

Backend должен запуститься на http://localhost:8080

### 6. Установите зависимости Frontend

```bash
cd frontend
npm install
```

### 7. Создайте `.env.local` для Frontend

```bash
# Windows
cd frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8080 > .env.local
echo NEXT_PUBLIC_APP_URL=http://localhost:3000 >> .env.local

# Linux/Mac
cd frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### 8. Запустите Frontend

```bash
cd frontend
npm run dev
```

Frontend должен запуститься на http://localhost:3000

### 9. Откройте браузер

```
http://localhost:3000
```

---

## 🔄 Ежедневная работа

### Запуск Backend

```bash
go run main.go
```

### Запуск Frontend

```bash
cd frontend
npm run dev
```

### Запуск всего через Docker

```bash
docker-compose up -d
```

---

## 🗄️ Работа с базой данных

### Применить миграции

```bash
go run cmd/migrator/main.go up
```

### Откатить миграции

```bash
go run cmd/migrator/main.go down
```

### Подключиться к БД (через Docker)

```bash
docker exec -it auth-db-1 psql -U auth -d authdb
```

### Подключиться к БД (локально)

```bash
psql -h localhost -U auth -d authdb
```

### Полезные SQL запросы

```sql
-- Посмотреть всех пользователей
SELECT * FROM users;

-- Сделать пользователя администратором
UPDATE users SET role = 'admin' WHERE id = 1;

-- Посмотреть refresh токены
SELECT * FROM refresh_tokens;

-- Очистить старые токены
DELETE FROM refresh_tokens WHERE expires_at < NOW();
```

---

## 🧪 Тестирование

### Проверка Backend API

```bash
# Health check
curl http://localhost:8080/health

# Получить текущего пользователя (нужен токен)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/me

# Получить список пользователей (нужна роль admin)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8080/admin/users
```

### Тестовые скрипты

```bash
# Windows
./test-api.ps1

# Linux/Mac
./test-api.sh
```

---

## 🐳 Docker команды

### Запуск всего стека

```bash
docker-compose up -d
```

### Остановка

```bash
docker-compose down
```

### Пересборка образов

```bash
docker-compose build
docker-compose up -d
```

### Логи

```bash
# Все логи
docker-compose logs -f

# Только backend
docker-compose logs -f backend

# Только БД
docker-compose logs -f db
```

### Очистка

```bash
# Остановить и удалить контейнеры
docker-compose down

# Удалить и volumes (⚠️ удалит данные БД)
docker-compose down -v
```

---

## 🔨 Сборка для продакшена

### Backend

```bash
# Сборка бинарника
go build -o user-service

# Windows
go build -o user-service.exe

# Запуск
./user-service  # или user-service.exe на Windows
```

### Frontend

```bash
cd frontend

# Сборка
npm run build

# Запуск production версии
npm start
```

---

## 🔍 Отладка

### Проверка портов

```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :8080
lsof -i :3000
```

### Проверка переменных окружения

```bash
# Backend (в Go коде можно добавить)
fmt.Println(os.Getenv("DISCORD_CLIENT_ID"))

# Frontend (в браузере)
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Очистка кэша

```bash
# Go
go clean -cache

# Frontend
cd frontend
rm -rf .next node_modules package-lock.json
npm install
```

---

## 📝 Git команды

### Первый коммит

```bash
git init
git add .
git commit -m "Initial commit: User Service with Go backend and Next.js frontend"
```

### Игнорировать файлы

Убедитесь что `.gitignore` включает:

```gitignore
# Backend
*.exe
user-service

# Frontend
frontend/node_modules/
frontend/.next/
frontend/.env.local

# Database
*.db

# IDE
.vscode/
.idea/

# Environment
.env
.env.local
```

---

## 🆘 Решение проблем

### "go: cannot find main module"

```bash
go mod init user-service
go mod tidy
```

### "npm ERR! network"

```bash
npm cache clean --force
npm install
```

### "dial tcp: connect: connection refused" (БД)

```bash
# Проверить что БД запущена
docker ps

# Перезапустить БД
docker-compose restart db
```

### "Port already in use"

```bash
# Найти процесс на порту (Windows)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Найти процесс на порту (Linux/Mac)
lsof -ti:8080 | xargs kill -9
```

---

## 📚 Дополнительная документация

- [README.md](./README.md) - Основная информация
- [QUICKSTART.md](./QUICKSTART.md) - Быстрый старт для новичков
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Детальное развертывание
- [UPDATE_DATABASE.md](./UPDATE_DATABASE.md) - Обновление БД
- [COMPLETED.md](./COMPLETED.md) - Что реализовано

---

**Удачи! 🚀**
