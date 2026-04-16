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

# If APP_KEY is missing, generate one without relying on artisan boot.
if ! grep -Eq "^APP_KEY=base64:[A-Za-z0-9+/=]+$" .env; then
  APP_KEY_VALUE="$(php -r 'echo "base64:".base64_encode(random_bytes(32));')"
  if grep -q "^APP_KEY=" .env; then
    sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY_VALUE}|" .env
  else
    printf "\nAPP_KEY=%s\n" "${APP_KEY_VALUE}" >> .env
  fi
fi

# Keep writable paths healthy at runtime.
mkdir -p storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R ug+rwx storage bootstrap/cache || true

# Bind nginx to Render dynamic port.
sed -i "s/listen 80;/listen ${PORT:-10000};/" /etc/nginx/http.d/default.conf

exec /usr/bin/supervisord -c /etc/supervisord.conf
