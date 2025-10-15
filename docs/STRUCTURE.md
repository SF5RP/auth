# 📁 Структура проекта

Описание организации файлов в проекте Auth Service.

---

## 🗂️ Обзор

```
auth-service/
├── 📂 backend/              # Go Backend API
├── 📂 frontend/             # Next.js Frontend
├── 📂 docs/                # Документация
├── 📂 deploy/              # Конфигурация деплоя
├── 📂 scripts/             # Вспомогательные скрипты
├── 📂 .github/             # GitHub CI/CD
├── 📄 docker-compose.yml   # Docker compose конфигурация
├── 📄 Dockerfile          # Docker образ
└── 📄 README.md           # Главная страница проекта
```

---

## 🔧 Backend (`/backend`)

Go backend с REST API и Discord OAuth2.

```
backend/
├── cmd/                    # Точки входа приложения
│   └── migrator/          # Утилита для миграций БД
│       └── main.go
│
├── internal/              # Внутренняя логика (не экспортируется)
│   ├── config/           # Конфигурация приложения
│   │   └── config.go
│   │
│   ├── database/         # Работа с БД
│   │   ├── db.go        # Подключение к PostgreSQL
│   │   ├── user_repo.go # Репозиторий пользователей
│   │   ├── token_repo.go # Репозиторий токенов
│   │   └── character_repo.go # Репозиторий персонажей
│   │
│   ├── handlers/         # HTTP обработчики
│   │   ├── handlers.go  # Базовые handlers
│   │   └── character_handlers.go
│   │
│   ├── middleware/       # HTTP middleware
│   │   └── auth.go      # JWT аутентификация
│   │
│   ├── models/          # Модели данных
│   │   └── user.go
│   │
│   └── services/        # Бизнес-логика
│       ├── auth.go      # Сервис авторизации
│       ├── user.go      # Сервис пользователей
│       └── character.go # Сервис персонажей
│
├── migrations/          # SQL миграции
│   ├── 0001_init.up.sql
│   ├── 0001_init.down.sql
│   ├── 0002_add_discriminator.up.sql
│   └── 0002_add_discriminator.down.sql
│
├── main.go             # Точка входа приложения
├── go.mod              # Go зависимости
├── go.sum              # Checksums зависимостей
├── env.example         # Пример конфигурации
└── README.md           # Backend документация
```

**Порт:** 8080  
**Технологии:** Go, Gin, PostgreSQL, JWT

---

## 💻 Frontend (`/frontend`)

Next.js 15 приложение с App Router и SSR.

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Корневой layout
│   │   ├── page.tsx           # Главная страница
│   │   ├── globalStyles.tsx   # Глобальные стили
│   │   ├── login/             # Страница логина
│   │   ├── callback/          # OAuth callback
│   │   ├── profile/           # Профиль пользователя
│   │   ├── servers/           # Список серверов
│   │   └── admin/             # Админ панель
│   │
│   ├── features/              # Feature-based модули
│   │   ├── auth/             # Авторизация
│   │   │   ├── authSlice.ts # Redux slice
│   │   │   └── hooks.ts     # Custom hooks
│   │   ├── characters/       # Персонажи
│   │   ├── servers/          # Серверы
│   │   └── admin/            # Админ функции
│   │
│   └── shared/               # Переиспользуемые компоненты
│       ├── components/       # React компоненты
│       │   ├── appLayout.tsx
│       │   ├── sidebar.tsx
│       │   └── providers.tsx
│       ├── hooks/           # Custom hooks
│       │   ├── redux.ts
│       │   └── useSidebar.ts
│       ├── lib/            # Утилиты
│       │   ├── api.ts      # API клиент
│       │   ├── store.ts    # Redux store
│       │   └── servers.ts
│       ├── types/          # TypeScript типы
│       │   ├── auth.ts
│       │   ├── character.ts
│       │   └── server.ts
│       └── ui/             # UI компоненты
│           ├── button.tsx
│           ├── card.tsx
│           └── container.tsx
│
├── public/                 # Статические файлы
│   ├── default-avatar.png
│   └── icons/             # Иконки серверов
│
├── package.json           # npm зависимости
├── tsconfig.json          # TypeScript конфигурация
├── next.config.js         # Next.js конфигурация
├── eslint.config.mjs      # ESLint правила
├── start-prod.js          # Production запуск
├── ecosystem.config.js    # PM2 конфигурация
└── README.md             # Frontend документация
```

**Порт:** 3000  
**Технологии:** Next.js 15, React 19, TypeScript, Redux Toolkit, React Query, Emotion

---

## 📚 Docs (`/docs`)

Вся документация проекта.

```
docs/
├── README.md              # Навигация по документации
├── DEPLOYMENT.md          # Инструкция по запуску
├── QUICKSTART.md          # Быстрый старт
├── INTEGRATION.md         # Интеграция компонентов
├── COMMANDS.md            # Полезные команды
├── UPDATE_DATABASE.md     # Работа с миграциями
├── PROJECT_STATUS.md      # Статус разработки
├── COMPLETED.md           # Завершенные функции
├── STRUCTURE.md           # Этот файл
└── init.md               # История проекта
```

---

## 🚀 Deploy (`/deploy`)

Конфигурация для production деплоя.

```
deploy/
├── nginx/                      # Nginx конфигурация
│   └── auth-service.conf      # Virtual host конфиг
│
├── systemd/                    # Systemd сервисы
│   └── auth-service.service   # Backend сервис
│
└── scripts/                    # Скрипты установки
    ├── install.sh             # Установка сервиса
    └── setup-postgres.sh      # Настройка PostgreSQL
```

**Технологии:** Nginx, Systemd, PostgreSQL

---

## 🔧 Scripts (`/scripts`)

Вспомогательные скрипты для разработки и деплоя.

```
scripts/
├── start.sh / start.bat           # Локальный запуск
├── test-api.sh / test-api.ps1     # Тестирование API
├── server-quick-setup.sh          # Автоустановка сервера
└── check-deployment-readiness.sh  # Проверка готовности
```

---

## ⚙️ GitHub (`/.github`)

CI/CD конфигурация.

```
.github/
└── workflows/
    └── deploy.yml    # GitHub Actions деплой
```

**Что делает:**

- Собирает Go бинарник
- Запускает тесты
- Деплоит на сервер
- Перезапускает сервис
- Проверяет health

---

## 📄 Корневые файлы

```
/
├── .dockerignore         # Исключения для Docker
├── .gitignore           # Исключения для Git
├── .yarnrc.yml          # Yarn конфигурация
├── .env.example         # Пример для docker-compose
├── docker-compose.yml   # Docker compose
├── Dockerfile          # Docker образ
├── env.example         # Устаревший (legacy)
└── README.md           # Главная страница
```

---

## 🔄 Потоки данных

### Авторизация через Discord

```
User → Frontend → Backend → Discord API
                     ↓
                PostgreSQL
                     ↓
                JWT Tokens
                     ↓
               Frontend (Cookie)
```

### API запросы

```
Frontend → Axios/Fetch → Backend API
                              ↓
                         JWT Verify
                              ↓
                         Database
                              ↓
                         Response
```

---

## 🗄️ База данных

**Таблицы:**

- `users` - Пользователи
- `refresh_tokens` - Refresh токены
- `characters` - Персонажи пользователей
- `servers` - Игровые серверы (опционально)

**Миграции:** `/backend/migrations`  
**Управление:** `go run backend/cmd/migrator/main.go`

---

## 🐳 Docker

### Сервисы в docker-compose

1. **db** - PostgreSQL 16
2. **migrate** - Применение миграций
3. **app** - Backend API (порт 8080)

### Volumes

- `db_data` - Данные PostgreSQL

---

## 📦 Зависимости

### Backend (Go)

```go.mod
github.com/gin-gonic/gin
github.com/lib/pq
github.com/golang-jwt/jwt/v5
github.com/joho/godotenv
github.com/sirupsen/logrus
```

### Frontend (npm)

```package.json
next: ^15.0.0
react: ^19.0.0
@reduxjs/toolkit: ^2.2.7
@tanstack/react-query: ^5.56.2
@emotion/react: ^11.13.3
react-hook-form: ^7.53.0
```

---

## 🔐 Конфигурация

### Backend

**Файл:** `backend/env.example` → `backend/config.env`  
**Переменные:** Discord OAuth, JWT, Database, Server Port

### Frontend

**Файл:** `frontend/.env.local` (опционально)  
**Переменные:** API URL

### Docker

**Файл:** `.env.example` → `.env`  
**Переменные:** Discord, JWT, Frontend URL

---

## 📈 Масштабирование

### Горизонтальное

- **Backend:** Несколько инстансов через Nginx load balancing
- **Frontend:** PM2 cluster mode
- **Database:** PostgreSQL репликация

### Вертикальное

- Увеличение ресурсов сервера
- Оптимизация запросов к БД
- Кэширование (Redis)

---

## 🔗 Полезные ссылки

- [Главная README](../README.md)
- [Backend README](../backend/README.md)
- [Frontend README](../frontend/README.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Project Status](./PROJECT_STATUS.md)
