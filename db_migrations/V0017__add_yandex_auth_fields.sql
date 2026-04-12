-- Добавляем поля для Yandex OAuth
ALTER TABLE users ADD COLUMN IF NOT EXISTS yandex_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Разрешаем email быть NULL (для OAuth без email)
ALTER TABLE users ALTER COLUMN email SET DEFAULT '';

-- Разрешаем password_hash быть NULL (OAuth-пользователи не имеют пароля)
ALTER TABLE users ALTER COLUMN password_hash SET DEFAULT '';

-- Индекс для быстрого поиска по yandex_id
CREATE INDEX IF NOT EXISTS idx_users_yandex_id ON users(yandex_id);
