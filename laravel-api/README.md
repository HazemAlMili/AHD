# AHD Laravel API

This directory is the current AHD backend authority. It is a Laravel 12/PHP 8.2+ REST API backed by MySQL and designed for conventional shared hosting. It preserves the existing React frontend's `/api/v1` response and field contract.

## Local Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=DatabaseSeeder
php artisan serve --host=127.0.0.1 --port=8010
```

The admin seeder creates an account only when `AHD_ADMIN_EMAIL` and `AHD_ADMIN_PASSWORD` are supplied through the local environment. `LocalParitySeeder` is disposable test data only and must never run against a production database.

## Shared Hosting

Set `APP_ENV=production`, `APP_DEBUG=false`, a protected `APP_KEY`, MySQL `DB_*` values, explicit `AHD_ALLOWED_ORIGINS`, admin bootstrap values, and a persistent `FILESYSTEM_DISK` outside Git. Point the document root at this directory's `public` folder. Keep `.env`, `vendor`, source, private storage, and logs inaccessible from the web.

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Use `FILESYSTEM_DISK=public` with a protected storage link for ordinary shared hosting, or configure the optional S3-compatible disk. Verify real HTTPS media upload/retrieval and secure cookies on the intended host before classifying production readiness.

## Verification

```bash
find app database/migrations database/seeders routes bootstrap tests -name '*.php' -print0 | xargs -0 -n1 php -l
php artisan migrate:fresh --force
php artisan migrate --force
php artisan migrate:status
php artisan test
php artisan route:list --path=api
```

The API has no lead, CRM, queue, booking, payment, account, or persisted matching-request routes.
