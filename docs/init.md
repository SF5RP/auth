# Auth-сервис (Go + Next.js)

## 🎯 Цель

Построить систему авторизации для сервисов платформы:

- Авторизация только через Discord (OAuth2)
- Auth backend на Go (API + JWT)
- Frontend на Next.js (UI для логина, профиля, админки)
- Хранение пользователей и ролей в БД
- JWT-токены для интеграции с другими сервисами

---

## 📐 Архитектура

[Пользователь] ⇄ [Next.js (UI)] ⇄ [Go Auth API] ⇄ [Discord API]
⇅
[Postgres/SQLite]

markdown
Копировать код

---

## 🗺️ Backend (Go)

### 1. Каркас (День 1–2)

- [x] Фреймворк: Gin
- [x] Маршруты `/health`, `/login`, `/callback`
- [x] `.env` для client_id / client_secret Discord
- [x] Логгер

### 2. Discord OAuth2 (День 3–4)

- [x] `/login` → редирект на Discord
- [x] `/callback` → получить `code`
- [x] Обмен `code` на `access_token`
- [x] Запрос `/users/@me`
- [x] Создать/обновить запись пользователя

### 3. JWT (День 5–6)

- [x] Access-токен (15 мин)
- [x] Refresh-токен (7 дней)
- [x] Ручка `/refresh`
- [x] Клеймы: `sub`, `role`, `exp`

### 4. БД и роли (День 7)

- [x] Таблица `users (id, discord_id, username, discriminator, avatar, role, created_at)`
- [x] Таблица `refresh_tokens (id, user_id, token, expires_at)`
- [x] Роли: `user`, `admin`, `moderator`

### 5. Middleware (День 8)

- [x] Проверка JWT в `Authorization: Bearer`
- [x] Добавление `userId` и `role` в `context`
- [x] Ошибки `401 Unauthorized`, `403 Forbidden`

### 6. API для профиля и админки (День 9–10)

- [x] `GET /me` → текущий пользователь
- [x] `GET /admin/users` (admin) → список пользователей
- [x] `POST /admin/users/:id/role` (admin) → смена роли

---

## 🗺️ Frontend (Next.js)

### 1. Пользовательский интерфейс

- [x] `/login` → кнопка «Войти через Discord» (редиректит на Go API `/login`)
- [x] `/profile` → ник, аватар, роль (через `/me`)
- [x] Хранение токена в cookies
- [x] `/callback` → обработка OAuth callback

### 2. Админка

- [x] `/admin/users` → список пользователей
- [x] Кнопка «сменить роль» → запрос `POST /admin/users/:id/role`
- [x] Проверка роли `admin` (на бэке и фронте)

### 3. Интеграция

- [x] После логина Go возвращает JWT
- [x] Next.js кладёт токен в cookie
- [x] Все запросы → с этим токеном
- [x] Redux Toolkit для auth state
- [x] React Query для API запросов

---

## 📦 Технологии

### Backend

- Go + Gin/Fiber
- `golang-jwt/jwt/v5`
- `gorm` + Postgres/SQLite
- `oauth2` (golang.org/x/oauth2)
- Dockerfile

### Frontend

- Next.js 15 (App Router)
- React Query или SWR
- MUI/Chakra/AntD
- Cookie для токенов

---

## ⏱️ Сроки

- Backend (Go) → **~2 недели**
- Frontend (Next.js) → **~1 неделя**
- Интеграция и тесты → **~3 недели суммарно**

---

## 🚀 Результат

- Единый вход через Discord
- Централизованная выдача JWT
- Роли пользователей
- UI для профиля и управления
- Лёгкая интеграция с другими сервисами
