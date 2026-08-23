#!/bin/sh
set -eu

cd /var/www/html

# Keep the generated key in the ignored Laravel .env so it survives container restarts.
if [ ! -f .env ]; then
  cp .env.example .env
fi
if ! grep -q '^APP_KEY=base64:' .env; then
  php artisan key:generate --force --no-interaction
fi

# The source mount can contain a host-generated cache; Docker must use DB_HOST=mysql.
php artisan config:clear --no-interaction

mkdir -p \
  storage/app/public \
  storage/app/private \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs
chown -R application:application storage

# Compose already gates this service on MySQL health; the retry also handles a cold named volume.
until php artisan db:show --no-interaction >/dev/null 2>&1; do
  sleep 2
done

php artisan migrate --force --no-interaction
php artisan db:seed --class=DatabaseSeeder --force --no-interaction

exec "$@"
