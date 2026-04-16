# ---------- STAGE 1: Composer (PHP dependencies) ----------
    FROM composer:2 AS vendor

    WORKDIR /app
    
    COPY composer.json composer.lock ./
    
    RUN composer install \
        --no-dev \
        --prefer-dist \
        --no-interaction \
        --no-progress \
        --optimize-autoloader \
        --no-scripts
    
    
    # ---------- STAGE 2: Node (Frontend assets) ----------
    FROM node:22 AS assets
    
    WORKDIR /app
    
    # Install PHP CLI so @laravel/vite-plugin-wayfinder can call artisan
    RUN apt-get update && apt-get install -y --no-install-recommends \
        php-cli \
        php-mbstring \
        php-xml \
        php-tokenizer \
        && rm -rf /var/lib/apt/lists/*
    
    # Build-time env vars for Vite
    ARG VITE_APP_URL
    ARG VITE_APP_NAME
    ARG VITE_PUSHER_APP_KEY
    ARG VITE_PUSHER_APP_CLUSTER
    ENV VITE_APP_URL=$VITE_APP_URL
    ENV VITE_APP_NAME=$VITE_APP_NAME
    ENV VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY
    ENV VITE_PUSHER_APP_CLUSTER=$VITE_PUSHER_APP_CLUSTER
    
    COPY package*.json ./
    RUN npm ci
    
    # Copy vendor so artisan can boot Laravel
    COPY --from=vendor /app/vendor ./vendor
    
    COPY . .
    
    RUN NODE_OPTIONS="--max-old-space-size=1536" npm run build
    
    
    # ---------- STAGE 3: Final App ----------
    FROM php:8.2-apache
    
    ENV APP_ENV=production
    ENV APP_DEBUG=false
    ENV LOG_CHANNEL=stderr
    ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
    ENV PORT=10000
    
    WORKDIR /var/www/html
    
    RUN apt-get update && apt-get install -y --no-install-recommends \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev \
        unzip \
        git \
        curl \
        && docker-php-ext-install pdo pdo_mysql mbstring bcmath zip exif pcntl \
        && rm -rf /var/lib/apt/lists/*
    
    RUN a2enmod rewrite \
        && sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
        && sed -ri -e 's!/var/www/!/var/www/html/public!g' /etc/apache2/apache2.conf
    
    COPY . .
    COPY --from=vendor /app/vendor ./vendor
    COPY --from=assets /app/public/build ./public/build
    
    RUN mkdir -p storage bootstrap/cache
    
    RUN php artisan package:discover --ansi || true
    RUN php artisan config:cache || true
    RUN php artisan route:cache || true
    RUN php artisan view:cache || true
    
    RUN chown -R www-data:www-data storage bootstrap/cache \
        && chmod -R ug+rwx storage bootstrap/cache
    
    EXPOSE 10000
    
    CMD ["sh", "-c", "sed -ri \"s/Listen 80/Listen ${PORT}/\" /etc/apache2/ports.conf && sed -ri \"s/:80/:${PORT}/\" /etc/apache2/sites-available/000-default.conf && apache2-foreground"]