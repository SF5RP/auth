# 🔐 Auth Service - Backend

Go backend для системы авторизации через Discord OAuth2.

---

## 🚀 Быстрый старт

### Установка зависимостей

```bash
go mod download
```

### Настройка конфигурации

```bash
cp env.example config.env
# Отредактируйте config.env
```

### Запуск миграций

```bash
go run cmd/migrator/main.go up
```

### Запуск сервера

```bash
go run main.go
```

Сервер запустится на `http://localhost:8080`

---

## 📁 Структура

```
backend/
├── cmd/                 # Точки входа приложения
│   └── migrator/       # Утилита миграций БД
│
├── internal/           # Внутренняя логика
│   ├── config/        # Конфигурация
│   ├── database/      # Репозитории БД
│   ├── handlers/      # HTTP handlers
│   ├── middleware/    # Middleware (auth, CORS)
│   ├── models/        # Модели данных
│   └── services/      # Бизнес-логика
│
├── migrations/        # SQL миграции
│
├── main.go           # Точка входа
├── go.mod            # Go dependencies
└── env.example       # Пример конфигурации
```

---

## 🔧 API Endpoints

### Публичные

- `GET /health` - Health check
- `GET /login` - Начало OAuth flow
- `GET /callback` - Discord callback
- `POST /refresh` - Обновление токенов

### Защищенные (требуют JWT)

- `GET /me` - Текущий пользователь
- `GET /characters` - Список персонажей
- `POST /characters` - Создать персонажа
- `DELETE /characters/:id` - Удалить персонажа

### Админские

- `GET /admin/users` - Список пользователей
- `POST /admin/users/:id/role` - Изменить роль

---

## 🗄️ База данных

### Миграции

```bash
# Применить все миграции
go run cmd/migrator/main.go up

# Откатить последнюю миграцию
go run cmd/migrator/main.go down

# Откатить все миграции
go run cmd/migrator/main.go down -all
```

### Подключение

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=authdb
DB_USER=auth
DB_PASSWORD=your_password
```

---

## 🧪 Тестирование

```bash
# Запуск всех тестов
go test ./...

# Тесты с покрытием
go test -cover ./...

# Verbose output
go test -v ./...
```

---

## 🔐 Переменные окружения

См. `env.example` для полного списка переменных.

**Обязательные:**

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `JWT_SECRET`
- `DB_PASSWORD`

---

## 📚 Документация

- [Главная](../README.md)
- [Полная документация](../docs/)
- [Деплой](../docs/DEPLOYMENT.md)

---

## 🛠️ Разработка

### Добавление новой миграции

Создайте файлы в `migrations/`:

```
XXXX_description.up.sql
XXXX_description.down.sql
```

### Добавление нового endpoint

1. Создайте handler в `internal/handlers/`
2. Добавьте route в `main.go`
3. При необходимости создайте service в `internal/services/`

### Запуск в Docker

```bash
# Из корня проекта
docker-compose up backend
```

---

## 🔧 Полезные команды

```bash
# Форматирование кода
go fmt ./...

# Линтинг
golangci-lint run

# Сборка бинарника
go build -o auth-service ./main.go

# Production build (Linux)
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o auth-service ./main.go
```
