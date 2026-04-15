FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader

FROM node:20 AS assets
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY resources ./resources
COPY public ./public
COPY vite.config.* ./
COPY tsconfig*.json ./
COPY postcss.config.* ./
COPY tailwind.config.* ./
RUN npm run build

FROM php:8.3-apache

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
ENV PORT=10000

WORKDIR /var/www/html

# Install required system packages and PHP extensions for Laravel.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql mbstring bcmath zip exif pcntl \
    && rm -rf /var/lib/apt/lists/*

# Configure Apache for Laravel's public document root.
RUN a2enmod rewrite \
    && sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
    && sed -ri -e 's!/var/www/!/var/www/html/public!g' /etc/apache2/apache2.conf

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

EXPOSE 10000

# Render injects PORT dynamically; bind Apache to it at container startup.
CMD ["sh", "-c", "sed -ri \"s/Listen 80/Listen ${PORT}/\" /etc/apache2/ports.conf && sed -ri \"s/:80/:${PORT}/\" /etc/apache2/sites-available/000-default.conf && apache2-foreground"]