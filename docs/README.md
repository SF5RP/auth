# 📚 Documentation

Документация проекта User Service.

---

## 📋 Содержание

### Начало работы

- **[QUICKSTART.md](./QUICKSTART.md)** - Быстрый старт для локальной разработки
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Полная инструкция по запуску
- **[DEPLOY_EXISTING_ORG.md](./DEPLOY_EXISTING_ORG.md)** - 🔄 Для существующей GitHub Organization
- **[STRUCTURE.md](./STRUCTURE.md)** - Структура проекта

### Разработка

- **[INTEGRATION.md](./INTEGRATION.md)** - Интеграция компонентов
- **[COMMANDS.md](./COMMANDS.md)** - Полезные команды
- **[UPDATE_DATABASE.md](./UPDATE_DATABASE.md)** - Работа с миграциями БД

### Статус проекта

- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Текущий статус разработки
- **[COMPLETED.md](./COMPLETED.md)** - Завершенные функции

### История

- **[init.md](./init.md)** - Начальная настройка проекта

---

## 🗂️ Структура проекта

```
user-service/
├── docs/                    # Документация (вы здесь)
├── cmd/                     # Точки входа приложения
│   └── migrator/           # Утилита миграций
├── internal/               # Внутренняя логика
│   ├── config/            # Конфигурация
│   ├── database/          # Репозитории БД
│   ├── handlers/          # HTTP handlers
│   ├── middleware/        # Middleware
│   ├── models/            # Модели данных
│   └── services/          # Бизнес-логика
├── migrations/            # SQL миграции
├── frontend/              # Next.js фронтенд
├── deploy/                # Конфигурация деплоя
│   ├── nginx/            # Nginx конфиги
│   ├── systemd/          # Systemd сервисы
│   └── scripts/          # Скрипты установки
├── scripts/               # Вспомогательные скрипты
└── .github/workflows/     # CI/CD
```

---

## 🚀 Быстрые ссылки

- [README.md](../README.md) - Главная страница проекта
- [env.example](../env.example) - Пример конфигурации
- [docker-compose.yml](../docker-compose.yml) - Docker compose файл
