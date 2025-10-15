# 🔄 Деплой для существующей GitHub Organization

> У вас уже есть Organization с настроенным деплоем в другом проекте

---

## ⚡ Быстрая настройка (5 шагов)

### 1️⃣ Измените порты (если на одном сервере)

Если деплоите на тот же сервер, где уже работает другой проект:

**`backend/env.example`:**

```env
SERVER_PORT=12410  # Ваш выделенный порт
```

**`deploy/nginx/auth-service.conf`:**

```nginx
upstream auth_backend {
    server 127.0.0.1:12410;  # Backend порт
}

upstream auth_frontend {
    server 127.0.0.1:12411;  # Frontend порт
}

server {
    server_name auth.yourdomain.com;  # Поддомен
    # ...
}
```

**`frontend/ecosystem.config.js`:**

```javascript
env: {
  PORT: 12411,  // Frontend порт
}
```

**`.github/workflows/deploy.yml`:**

```yaml
SERVER_PORT=12410 # В секции создания .env (строка ~98)
```

---

### 2️⃣ Organization Secrets (общие для всех проектов)

**GitHub Organization → Settings → Secrets → New organization secret**

Добавьте только если их еще нет:

```
SERVER_HOST=123.45.67.89
SERVER_USER=deploy
SSH_PRIVATE_KEY=<ваш_существующий_ssh_ключ>
```

💡 **Переиспользуйте SSH ключ** из другого проекта!

---

### 3️⃣ Repository Secrets (уникальные для auth-service)

**Этот репозиторий → Settings → Secrets → New repository secret**

```
DB_NAME=authdb
DB_USER=auth
DB_PASSWORD=<новый_уникальный_пароль>
DB_HOST=localhost
DB_PORT=5432

DISCORD_CLIENT_ID=<создайте_новое_discord_приложение>
DISCORD_CLIENT_SECRET=<secret_нового_приложения>
DISCORD_REDIRECT_URI=https://auth.yourdomain.com/callback

JWT_SECRET=<openssl rand -base64 64>
FRONTEND_URL=https://auth.yourdomain.com
ADMIN_DISCORD_IDS=<ваш_discord_user_id>
```

**⚠️ Создайте НОВОЕ Discord приложение** (не переиспользуйте старое!)

---

### 4️⃣ Создайте базу данных на сервере

```bash
ssh deploy@YOUR_SERVER_IP

sudo -u postgres psql <<EOF
CREATE DATABASE authdb;
CREATE USER auth WITH PASSWORD 'PASSWORD_FROM_SECRETS';
GRANT ALL PRIVILEGES ON DATABASE authdb TO auth;
\c authdb
GRANT ALL ON SCHEMA public TO auth;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO auth;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO auth;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO auth;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO auth;
EOF
```

---

### 5️⃣ Настройте поддомен и деплойте

**DNS (у провайдера):**

```
Type: A
Name: auth
Value: YOUR_SERVER_IP
```

**Git:**

```bash
git add .
git commit -m "Setup deployment for existing organization"
git push origin main
```

GitHub Actions развернёт backend автоматически! ✅

**После успешного деплоя, на сервере:**

```bash
ssh deploy@YOUR_SERVER_IP

# Nginx
sudo cp /home/deploy/auth-service/deploy/nginx/auth-service.conf \
       /etc/nginx/sites-available/auth-service
sudo ln -s /etc/nginx/sites-available/auth-service \
           /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d auth.yourdomain.com

# Frontend
cd /home/deploy/auth-service/frontend
npm install
pm2 start ecosystem.config.js
pm2 save
```

---

## 📊 Чек-лист

- [ ] Изменил порты в 4 файлах (если на одном сервере)
- [ ] Добавил Organization Secrets (общие)
- [ ] Добавил Repository Secrets (уникальные)
- [ ] Создал новое Discord приложение
- [ ] Создал базу данных на сервере
- [ ] Настроил DNS (A-запись для auth)
- [ ] Сделал push в main
- [ ] Проверил деплой в GitHub Actions
- [ ] Настроил Nginx на сервере
- [ ] Получил SSL сертификат
- [ ] Запустил Frontend через PM2
- [ ] Проверил работу: `curl https://auth.yourdomain.com/health`

---

## 🎯 Краткая шпаргалка

| Параметр       | Проект 1          | Auth Service (этот)      |
| -------------- | ----------------- | ------------------------ |
| Backend порт   | 8080              | **8081**                 |
| Frontend порт  | 3000              | **3001**                 |
| Домен          | yourdomain.com    | **auth.yourdomain.com**  |
| База данных    | project1_db       | **authdb**               |
| DB user        | project1_user     | **auth**                 |
| Systemd сервис | project1.service  | **auth-service.service** |
| PM2 процесс    | project1-frontend | **auth-frontend**        |
| Discord OAuth  | App 1             | **App 2 (новое!)**       |

---

## ✅ Что переиспользовать

- ✅ SSH ключ (через Organization Secrets)
- ✅ Пользователь deploy
- ✅ PostgreSQL сервер (новая БД)
- ✅ Nginx (новый конфиг)
- ✅ Node.js & PM2

## ❌ Что должно быть уникально

- ❌ Порты приложений
- ❌ Имена сервисов
- ❌ База данных
- ❌ Discord OAuth приложение
- ❌ JWT Secret
- ❌ Домен/поддомен

---

## 🆘 Частые вопросы

### Нужно ли запускать server-quick-setup.sh?

❌ **Нет!** Сервер уже настроен. Просто создайте новую БД.

### Можно ли использовать тот же SSH ключ?

✅ **Да!** Добавьте его как Organization Secret, оба проекта будут использовать.

### Нужно ли новое Discord приложение?

✅ **Да!** Каждый проект должен иметь свое приложение с уникальным Redirect URI.

### Проверка портов

```bash
ssh deploy@server
sudo netstat -tulpn | grep LISTEN

# Занято:
# :8080 - project1 backend
# :3000 - project1 frontend
#
# Свободно для auth-service:
# :8081 - backend
# :3001 - frontend
```

---

## 📚 Дополнительно

- [Полная документация](./DEPLOYMENT.md)
- [Структура проекта](./STRUCTURE.md)
- [Команды](./COMMANDS.md)

---

**💡 Главное:** Измените порты → Используйте Organization Secrets → Push в main!
