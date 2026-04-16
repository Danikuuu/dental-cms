FROM php:8.4-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    zip \
    unzip \
    git \
    oniguruma-dev \
    libxml2-dev \
    nodejs \
    npm \
    && docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath xml

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Default runtime values aligned with .env (can be overridden in Render env vars)
ENV APP_ENV=local \
    APP_DEBUG=true \
    LOG_CHANNEL=stack \
    SESSION_DRIVER=database \
    CACHE_STORE=database \
    APP_URL=http://localhost:8000 \
    PORT=10000

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies and build assets
RUN npm ci && npm run build

# Set permissions
RUN chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Copy nginx config
COPY conf/nginx/nginx-site.conf /etc/nginx/http.d/default.conf

# Copy supervisor config
COPY conf/supervisord.conf /etc/supervisord.conf

COPY scripts/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 80

CMD ["/usr/local/bin/start.sh"]