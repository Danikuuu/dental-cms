#!/usr/bin/env sh
set -eu

cd /var/www/html

# Ensure env file exists in container.
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
  else
    cat > .env <<'EOF'
APP_ENV=production
APP_DEBUG=false
LOG_CHANNEL=stderr
APP_URL=http://localhost:8000
SESSION_DRIVER=file
CACHE_STORE=file
EOF
  fi
fi

# If APP_KEY is not provided by Render, generate one so Laravel can boot.
if ! grep -q "^APP_KEY=base64:" .env; then
  php artisan key:generate --force --no-interaction >/dev/null 2>&1 || true
fi

# Keep writable paths healthy at runtime.
mkdir -p storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R ug+rwx storage bootstrap/cache || true

# Bind nginx to Render dynamic port.
sed -i "s/listen 80;/listen ${PORT:-10000};/" /etc/nginx/http.d/default.conf

exec /usr/bin/supervisord -c /etc/supervisord.conf
