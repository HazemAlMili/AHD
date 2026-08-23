# AHD (عهد)

AHD is a Saudi domestic-worker discovery and sponsorship/service-transfer request website. Operations staff maintain a controlled catalogue; customers browse published profiles or describe a household need; the website validates the request and hands it to the configured business WhatsApp conversation. Sales and operations continue outside the website.

> **MVP loop:** Admin manages inventory → public catalogue or matching landing page → short validated form → structured WhatsApp handoff.

The approved production architecture is **React/Vite + Laravel + MySQL on conventional PHP shared hosting**. The migration preserves the verified product behavior and does not introduce CRM, lead persistence, accounts, bookings, payments, marketplace chat, queues, Redis, BullMQ, or government-transfer integration.

## Current Runtime Stack

| Layer | Current authority |
|---|---|
| Public/admin frontend | React 19, TypeScript, Vite, wouter, Tailwind CSS, Lucide primitives in `artifacts/khadematy-site` |
| Production API | Laravel 12, PHP 8.3-compatible, REST routes in `laravel-api/routes/api.php` |
| Production database | MySQL 8-compatible, `utf8mb4`, Laravel migrations in `laravel-api/database/migrations` |
| Validation/auth | Laravel request validation, hashed passwords, opaque SHA-256 session-token records, HTTP-only cookie, role middleware |
| Domain model | Eloquent models and relationships for workers, taxonomies, media, content, settings, sessions, and audit logs |
| Media | Laravel Filesystem abstraction; local/public disk is shared-host compatible and S3-compatible storage remains optional |
| Customer conversion | Temporary React state → shared Zod/message builders → trusted `wa.me` URL; no CRM or request persistence |
| Quality | PHP syntax checks, Laravel feature tests against disposable MySQL, React lint/typecheck/tests/build, browser golden slices, route inspection, security checks |

The previous Express/PostgreSQL implementation under `artifacts/api-server`, `lib/db`, and `db/migrations` remains preserved as the verified behavioral reference and rollback comparison. It no longer defines the current production architecture; see `docs/HISTORICAL_ARTIFACTS.md`.

## Repository Layout

| Path | Responsibility |
|---|---|
| `artifacts/khadematy-site` | Maintained React/Vite public website and admin interface |
| `laravel-api` | Current Laravel 12 production backend, MySQL migrations, Eloquent models, API routes, middleware, seeders, and tests |
| `artifacts/api-server` | Superseded Express API reference; do not deploy as the current backend after Laravel parity |
| `lib/api-zod` | Shared validation and WhatsApp message-building domain helpers |
| `lib/db` and `db/migrations` | Superseded PostgreSQL declarations/migrations retained for comparison only |
| `docs` | Canonical product, architecture, API, security, testing, acceptance, planning, and history documents |
| `.github/workflows/ci.yml` | Node/frontend verification plus a MySQL-backed Laravel verification job |
| `artifacts/mockup-sandbox` | Historical visual/prototype artifact; not a production application |

## Canonical Documentation Read Order

1. `docs/PRODUCT.md` — product identity and scope.
2. `docs/AHD_BRD.md` — business requirements only.
3. `docs/AHD_TRD.md` — current Laravel/MySQL technical baseline.
4. `docs/ARCHITECTURE.md` — shared-hosting topology and boundaries.
5. `AGENTS.md` — operating contract.
6. `docs/CONVENTIONS.md` — Laravel, React, MySQL, and API conventions.
7. `docs/SECURITY.md` — verified controls and deployment checks.
8. `docs/API.md` — current Laravel route contract.
9. `docs/TESTING.md` — test and golden-slice evidence.
10. `docs/ACCEPTANCE_CRITERIA.md` — final behavior gates.
11. `docs/EXECUTION_PLAN.md` — migration and deployment sequence.
12. `docs/PLANS.md` — change-control protocol.
13. `docs/LANDING_FUNNEL_INTEGRATION_MAP.md` — funnel and attribution map.
14. `docs/HISTORICAL_ARTIFACTS.md` — superseded files and paths.
15. `CODEX_MEMORY.md` — durable verified state.

## Local Setup

For the zero-host-runtime workflow, use the dedicated [Docker local development guide](docs/DOCKER_LOCAL_DEVELOPMENT.md). It starts the React/Vite frontend, Laravel/PHP-FPM API, Nginx same-origin gateway, and MySQL entirely through Docker Compose. Docker is local-only; production remains conventional PHP/MySQL shared hosting.

The manual workflow below remains available when PHP, Composer, MySQL, Node, and pnpm are intentionally installed on the host. The backend requires PHP 8.2 or newer, Composer, the `pdo_mysql`, `mbstring`, `xml`, `curl`, and `zip` extensions, and a MySQL database. The frontend remains Node 22 with pnpm 11.21.0.

```bash
cd laravel-api
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=DatabaseSeeder
php artisan serve --host=127.0.0.1 --port=8010
```

Set `AHD_ADMIN_EMAIL` and `AHD_ADMIN_PASSWORD` only in a protected local/deployment environment before running the seeder. For the frontend, use a second terminal:

```bash
cd /home/ubuntu/AHD
VITE_API_URL=http://localhost:8010/api/v1 PORT=5180 pnpm --filter @workspace/ahd-site dev
```

For same-origin shared hosting, build the frontend as static assets with `VITE_API_URL=/api/v1`, serve the intended public directory, and route `/api/*` to Laravel's `public/index.php`.

## Production Migration and Deployment

Create the MySQL database with `utf8mb4`, configure the Laravel `.env` outside Git, ensure the hosting document root exposes only Laravel's `public` entry point and the built React assets, then run:

```bash
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Use `APP_ENV=production`, `APP_DEBUG=false`, a real `APP_KEY`, HTTPS, secure HTTP-only cookies, an explicit `AHD_ALLOWED_ORIGINS` allowlist, and either a persistent local/public Filesystem disk or an approved S3-compatible disk. Do not expose `.env`, `vendor`, private storage, or application source through the web root. Real shared-hosting PHP version, extension, HTTPS, storage, and domain checks must be performed against the intended host; local verification cannot substitute for them.

## Verification

```bash
cd laravel-api
php -l app/Http/Controllers/ApiController.php
php artisan route:list --path=api
DB_CONNECTION=mysql DB_PASSWORD='<local-only-value>' php artisan test
php artisan migrate:status

cd /home/ubuntu/AHD
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
PORT=3001 BASE_PATH=/ pnpm build
pnpm audit --audit-level=high
```

The verified Laravel golden slices are admin login → worker create → taxonomy/skill assignment → save → publish → MySQL persistence → public API → React catalogue/profile → specific-worker WhatsApp preview, and matching Step 1 → Step 2 → WhatsApp preview. No message is sent by automated verification.
