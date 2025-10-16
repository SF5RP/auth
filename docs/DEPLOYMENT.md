# 🚀 Инструкция по запуску User Service

## Описание проекта

Полноценная система авторизации через Discord OAuth2 с бэкендом на Go и фронтендом на Next.js 15.

### Технологии

**Backend:**

- Go + Gin
- PostgreSQL
- JWT токены
- Discord OAuth2

**Frontend:**

- Next.js 15 (App Router)
- React 19 + TypeScript
- Redux Toolkit
- React Query (TanStack Query)
- Emotion (CSS-in-JS)

---

## 📋 Предварительные требования

1. **Go** 1.21+ ([установка](https://golang.org/doc/install))
2. **Node.js** 18+ и npm ([установка](https://nodejs.org/))
3. **PostgreSQL** 14+ ([установка](https://www.postgresql.org/download/))
4. **Discord Application** (см. раздел "Настройка Discord")

---

## 🔧 Настройка Discord Application

1. Перейдите на [Discord Developer Portal](https://discord.com/developers/applications)
2. Нажмите "New Application" и дайте ей имя
3. В разделе **OAuth2** скопируйте:
   - **Client ID**
   - **Client Secret**
4. Добавьте **Redirect URL**:
   ```
   http://localhost:8080/callback
   ```
5. В разделе **OAuth2 → URL Generator** выберите scope `identify`

---

## 🗄️ Настройка базы данных

### Вариант 1: Docker (рекомендуется)

```bash
# Запуск PostgreSQL через Docker
docker-compose up -d db
```

### Вариант 2: Локальная PostgreSQL

Создайте базу данных вручную:

```sql
CREATE DATABASE authdb;
CREATE USER auth WITH PASSWORD 'authpassword';
GRANT ALL PRIVILEGES ON DATABASE authdb TO auth;
```

### Запуск миграций

```bash
# Применить миграции
go run cmd/migrator/main.go up

# Откатить миграции (если нужно)
go run cmd/migrator/main.go down
```

---

## ⚙️ Настройка переменных окружения

### Backend

Отредактируйте файл `config.env`:

```env
# Discord OAuth2
DISCORD_CLIENT_ID=ваш_client_id_из_discord
DISCORD_CLIENT_SECRET=ваш_client_secret_из_discord
DISCORD_REDIRECT_URI=http://localhost:8080/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=ваш_очень_длинный_и_безопасный_секретный_ключ

# Server
SERVER_PORT=8080
ENVIRONMENT=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=auth
DB_PASSWORD=authpassword
DB_NAME=authdb
DATABASE_URL=postgres://auth:authpassword@localhost:5432/authdb?sslmode=disable
```

### Frontend

Создайте файл `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Запуск приложения

### 1. Запуск Backend

```bash
# Установка зависимостей
go mod tidy

# Запуск миграций
go run cmd/migrator/main.go up

# Запуск сервера
go run main.go
```

Backend запустится на `http://localhost:8080`

### 2. Запуск Frontend

```bash
# Переход в папку frontend
cd frontend

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

Frontend запустится на `http://localhost:3000`

---

## 📱 Использование приложения

1. Откройте браузер и перейдите на `http://localhost:3000`
2. Нажмите "Войти через Discord"
3. Авторизуйтесь через Discord
4. Вы будете перенаправлены на страницу профиля

### Роли пользователей

По умолчанию все новые пользователи получают роль `user`.

Роли:

- **user** - обычный пользователь
- **moderator** - модератор
- **admin** - администратор (доступ к админ панели)

Для изменения роли первого пользователя на `admin`, выполните SQL:

```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```

После этого вы сможете управлять ролями других пользователей через админ панель.

---

## 🐳 Запуск через Docker

### Запуск всего стека

```bash
# Запуск БД, Backend и Frontend
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Только Backend и БД

```bash
docker-compose up -d db backend
```

---

## 🔍 Тестирование API

### Health Check

```bash
curl http://localhost:8080/health
```

### Получить токены (после авторизации)

Токены автоматически сохраняются в cookies фронтенда после успешной авторизации.

### Получить информацию о текущем пользователе

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8080/me
```

### Получить список пользователей (admin)

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8080/admin/users
```

### Изменить роль пользователя (admin)

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}' \
  http://localhost:8080/admin/users/2/role
```

---

## 📂 Структура проекта

```
auth/
├── backend/
│   ├── cmd/
│   │   └── migrатор/          # Миграции БД
│   ├── internal/
│   │   ├── config/            # Конфигурация
│   │   ├── database/          # Репозитории БД
│   │   ├── handlers/          # HTTP обработчики
│   │   ├── middleware/        # Middleware
│   │   ├── models/            # Модели данных
│   │   └── services/          # Бизнес-логика
│   ├── migrations/            # SQL миграции
│   └── main.go               # Точка входа
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js страницы
│   │   ├── features/         # Feature-модули
│   │   └── shared/           # Общий код
│   └── package.json
│
├── docker-compose.yml        # Docker конфигурация
├── config.env               # Backend переменные
└── DEPLOYMENT.md            # Эта инструкция
```

---

## 🛠️ Разработка

### Backend

```bash
# Запуск в режиме разработки
go run main.go

# Запуск с автоперезагрузкой (нужен air)
air

# Тестирование
go test ./...
```

### Frontend

```bash
cd frontend

# Разработка
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm start

# Линтинг
npm run lint
```

---

## 🐛 Решение проблем

### Backend не подключается к БД

1. Проверьте что PostgreSQL запущен
2. Проверьте параметры подключения в `config.env`
3. Проверьте что миграции выполнены

### Discord OAuth не работает

1. Проверьте Client ID и Client Secret в `config.env`
2. Убедитесь что Redirect URI добавлен в Discord Application
3. Проверьте что Redirect URI совпадает в Discord и `config.env`

### Frontend не подключается к Backend

1. Проверьте что Backend запущен на порту 8080
2. Проверьте `NEXT_PUBLIC_API_URL` в `.env.local`
3. Проверьте CORS настройки в Backend

### Ошибка "Invalid refresh token"

Токены могут истечь или быть удалены из БД. Просто авторизуйтесь заново.

---

## 📈 Следующие шаги

- [ ] Добавить rate limiting
- [ ] Добавить email уведомления
- [ ] Добавить логирование действий
- [ ] Добавить мониторинг (Prometheus, Grafana)
- [ ] Добавить unit и e2e тесты
- [ ] Настроить CI/CD pipeline
- [ ] Добавить поддержку других OAuth провайдеров

---

## 📝 Лицензия

MIT

---

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы, создайте issue в репозитории проекта.
