# Yandex Maps Reviews Parser

Web-приложение для парсинга и отображения отзывов с Яндекс Карт. Позволяет загружать отзывы из разных организаций и просматривать их в удобном интерфейсе.

## Возможности

- Парсинг отзывов с Яндекс Карт по URL организации (используется Node.js + Puppeteer/Chromium в Docker-контейнере)
- Извлечение информации: название организации, рейтинг, количество отзывов, текст отзывов
- Мульти-организации: поддержка нескольких организаций одновременно
- Кэширование: данные кэшируются на 1 час для оптимизации
- Адаптивный дизайн: удобный интерфейс с боковой панелью
- Закрытый доступ: авторизация только по предустановленной учетной записи (публичная регистрация отключена)

## Технологии

- Backend: PHP 8.2+, Laravel 11, MySQL 8.0, Node.js (Puppeteer & Chromium)
- Frontend: Vue 3, Vite, CSS
- DevOps: Docker & Docker Compose, Nginx

## Требования

- Docker 20.10+
- Docker Compose 2.0+
- Git

## Установка и запуск (Локально / Разработка)

1. Клонирование репозитория

- git clone https://github.com/yermek-coder/yandex-maps-reviews-parser.git
- cd yandex-maps-reviews-parser

2. Настройка окружения
   Скопируйте файлы примеров окружения:

- cp backend/.env.example backend/.env
- cp frontend/.env.example frontend/.env

3. Запуск через Docker Compose
   Сборка образов и запуск всех контейнеров в фоновом режиме:

- docker-compose up -d --build

4. Инициализация БД и создание сид-пользователя
   Публичная регистрация в приложении отключена. Для создания учетной записи администратора выполните команду миграции с флагом --seed:

- docker exec php-backend php /var/www/html/artisan migrate:fresh --seed --force

Данные для входа по умолчанию (генерируются из DatabaseSeeder):

- Email: test@example.com
- Пароль: password

5. Доступ к приложению

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- MySQL: localhost:3307

## Использование

### Авторизация

1. Откройте в браузере http://localhost:5173
2. Введите учетные данные сид-пользователя (test@example.com / password).
3. Форма регистрации в интерфейсе отсутствует, доступ предоставляется только существующим в базе пользователям.

### Добавление организации

1. Перейдите в раздел "Настройка".
2. Вставьте ссылку на организацию с Яндекс Карт в формате:
   https://yandex.ru/maps/org/название_организации/ID_организации/reviews/
3. Нажмите кнопку "Сохранить".

## Развертывание на Ubuntu VPS (Production)

Шаг 1: Обновление системы и установка Docker

- sudo apt update && sudo apt upgrade -y
- sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

Шаг 2: Клонирование и настройка окружения
Клонируйте проект в рабочую директорию (например, ~/app) и настройте конфиги. В файле backend/.env обязательно измените параметры на продакшн-значения:

- APP_ENV=production
- APP_DEBUG=false
- APP_URL=https://your-domain.com
- DB_HOST=db
- DB_DATABASE=laravel
- DB_USERNAME=laravel
- DB_PASSWORD=your_secure_password_here

Шаг 3: Запуск и оптимизация Laravel

- docker compose up -d --build
- docker compose exec backend php artisan migrate --seed --force
- docker compose exec backend php artisan optimize

## Устранение проблем

Проблема: База пуста или сбросился пользователь
Если вы случайно очистили таблицы или пересоздали БД, вернуть дефолтного юзера можно одной командой без перезапуска контейнеров:

- docker exec php-backend php /var/www/html/artisan db:seed

Проблема: Ошибки прав доступа к логам или кэшу (Permission Denied)
Если Laravel не может писать логи, сбросьте права на папки внутри контейнера:

- docker exec -it php-backend chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

Проблема: Не парсятся отзывы (логи скрапера)
Проверить, как отрабатывает Chromium внутри контейнера при запросах к Яндексу:

- docker exec php-backend tail -f /var/www/html/storage/logs/laravel.log
