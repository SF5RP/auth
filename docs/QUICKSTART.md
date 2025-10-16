# ⚡ Быстрый старт

Простая пошаговая инструкция для запуска проекта за 5 минут!

## ✅ Что нужно установить

1. **Go** 1.21+ - https://golang.org/doc/install
2. **Node.js** 18+ - https://nodejs.org/
3. **PostgreSQL** 14+ - https://www.postgresql.org/download/

## 📝 Шаг 1: Discord Application

1. Перейдите на https://discord.com/developers/applications
2. Нажмите "New Application"
3. Дайте имя приложению
4. В разделе **OAuth2** скопируйте:
   - `Client ID`
   - `Client Secret`
5. В **OAuth2 → Redirects** добавьте:
   ```
   http://localhost:8080/callback
   ```
6. Сохраните изменения

## 🔧 Шаг 2: Настройка переменных

Отредактируйте файл `config.env`:

```env
DISCORD_CLIENT_ID=ваш_client_id
DISCORD_CLIENT_SECRET=ваш_client_secret
DISCORD_REDIRECT_URI=http://localhost:8080/callback
FRONTEND_URL=http://localhost:3000
JWT_SECRET=придумайте_длинный_секретный_ключ_минимум_32_символа
```

Создайте `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Шаг 3: База данных

### Вариант A: Через Docker (быстрее)

```bash
docker-compose up -d db
```

### Вариант B: Локальный PostgreSQL

```sql
CREATE DATABASE authdb;
CREATE USER auth WITH PASSWORD 'authpassword';
GRANT ALL PRIVILEGES ON DATABASE authdb TO auth;
```

### Примените миграции:

```bash
go run cmd/migrator/main.go up
```

## 🚀 Шаг 4: Запуск

### Терминал 1: Backend

```bash
go mod tidy
go run main.go
```

Должно появиться:

```
User Service started on :8080
```

### Терминал 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

Должно появиться:

```
ready - started server on 0.0.0.0:3000
```

## 🎉 Готово!

Откройте браузер: http://localhost:3000

1. Нажмите "Войти через Discord"
2. Авторизуйтесь
3. Вы попадете в профиль!

## 🔑 Как получить доступ к админ панели?

После первого входа выполните SQL:

```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```

Теперь вы администратор! Перезайдите на сайт и в профиле появится кнопка "Админ панель".

## ❗ Частые проблемы

### "Cannot connect to database"

- Убедитесь что PostgreSQL запущен
- Проверьте параметры подключения в `config.env`

### "Discord OAuth error"

- Проверьте Client ID и Secret
- Убедитесь что Redirect URI добавлен в Discord Application
- Redirect URI должен точно совпадать

### "Port 8080 already in use"

- Измените порт в `config.env`: `SERVER_PORT=8081`
- И в `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8081`

### "Cannot find module" на фронтенде

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Дополнительно

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Полная инструкция по развертыванию
- [README.md](./README.md) - Общая информация о проекте
- [frontend/README.md](./frontend/README.md) - Документация фронтенда

## 🆘 Нужна помощь?

Создайте Issue в репозитории проекта!
