# ---------- STAGE 1: Composer (PHP dependencies) ----------
    FROM composer:2 AS vendor

    WORKDIR /app
    
    COPY composer.json composer.lock ./
    
    # Install dependencies WITHOUT running Laravel scripts yet
    RUN composer install \
        --no-dev \
        --prefer-dist \
        --no-interaction \
        --no-progress \
        --optimize-autoloader \
        --no-scripts
    
    
    # ---------- STAGE 2: Node (Frontend assets) ----------
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
    
    
    # ---------- STAGE 3: Final App ----------
    FROM php:8.2-apache
    
    ENV APP_ENV=production
    ENV APP_DEBUG=false
    ENV LOG_CHANNEL=stderr
    ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
    ENV PORT=10000
    
    WORKDIR /var/www/html
    
    # Install system dependencies and PHP extensions
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
    
    # Enable Apache rewrite + set Laravel public folder
    RUN a2enmod rewrite \
        && sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
        && sed -ri -e 's!/var/www/!/var/www/html/public!g' /etc/apache2/apache2.conf
    
    # Copy full app
    COPY . .
    
    # Copy built dependencies
    COPY --from=vendor /app/vendor ./vendor
    COPY --from=assets /app/public/build ./public/build
    
    # Ensure required Laravel folders exist
    RUN mkdir -p storage bootstrap/cache
    
    # Run Laravel optimizations (safe even if env not fully ready)
    RUN php artisan package:discover --ansi || true
    RUN php artisan config:cache || true
    RUN php artisan route:cache || true
    RUN php artisan view:cache || true
    
    # Fix permissions
    RUN chown -R www-data:www-data storage bootstrap/cache \
        && chmod -R ug+rwx storage bootstrap/cache
    
    EXPOSE 10000
    
    # Start Apache on Render dynamic port
    CMD ["sh", "-c", "sed -ri \"s/Listen 80/Listen ${PORT}/\" /etc/apache2/ports.conf && sed -ri \"s/:80/:${PORT}/\" /etc/apache2/sites-available/000-default.conf && apache2-foreground"]
    