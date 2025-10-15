# 📝 Обновление базы данных

Если вы уже запускали старую версию проекта, вам нужно обновить структуру базы данных.

## Вариант 1: Автоматическое обновление (рекомендуется)

Просто запустите миграции заново:

```bash
go run cmd/migrator/main.go up
```

Миграции умные - они применят только те изменения, которых еще нет в БД.

## Вариант 2: Ручное обновление через SQL

Если вы предпочитаете ручное управление, выполните SQL:

```sql
-- Добавляем поле discriminator
ALTER TABLE users ADD COLUMN IF NOT EXISTS discriminator VARCHAR(10) NOT NULL DEFAULT '0';
```

## Вариант 3: Пересоздание БД с нуля

⚠️ **Внимание:** Это удалит все данные!

```bash
# Откатываем все миграции
go run cmd/migrator/main.go down

# Применяем заново
go run cmd/migrator/main.go up
```

## Проверка обновления

После обновления проверьте структуру таблицы:

```sql
\d users  -- В psql
```

Или через SQL:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

Должны быть следующие поля:

- id (integer)
- discord_id (varchar)
- username (varchar)
- **discriminator (varchar)** ← новое поле
- avatar (text)
- role (varchar)
- created_at (timestamp)

## Обновление через Docker

Если вы используете Docker:

```bash
# Остановите контейнеры
docker-compose down

# Запустите снова (миграции применятся автоматически при старте backend)
docker-compose up -d
```

## Проблемы?

### "column already exists"

Это нормально - значит поле уже добавлено. Продолжайте работу.

### "relation does not exist"

Возможно, БД не была инициализирована. Выполните:

```bash
go run cmd/migrator/main.go up
```

### Другие ошибки

Проверьте подключение к БД в `config.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=auth
DB_PASSWORD=authpassword
DB_NAME=authdb
```

## После обновления

После успешного обновления БД:

1. Перезапустите backend:

   ```bash
   go run main.go
   ```

2. Перезапустите frontend:

   ```bash
   cd frontend
   npm run dev
   ```

3. Войдите заново через Discord

Готово! 🎉

