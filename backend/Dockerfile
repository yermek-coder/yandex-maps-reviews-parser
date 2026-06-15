FROM php:8.2-fpm-alpine

WORKDIR /var/www/html

RUN apk add --no-cache \
    bash \
    git \
    zip \
    unzip \
    icu-dev \
    libzip-dev \
    mysql-client \
    oniguruma-dev \
    nodejs \
    npm \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && docker-php-ext-install intl pdo pdo_mysql zip

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install Node.js dependencies for scraper
COPY scraper/package.json /var/www/html/scraper/

# Устанавливаем зависимости скрапера
RUN cd /var/www/html/scraper && npm install --production

COPY . /var/www/html

# On start: install deps (so vendor exists when volume is mounted), then run php-fpm
ENTRYPOINT ["/bin/sh", "-c", "composer install --no-interaction --no-dev || true; exec php-fpm"]