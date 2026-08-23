# AHD Docker Local Development

AHD provides a complete Docker Compose environment for local development. The host needs **Docker Desktop or Docker Engine with Compose**; it does not need PHP, Composer, MySQL, Node.js, pnpm, Nginx, or Apache. Docker is a local-development wrapper only. Production remains React static assets plus Laravel/PHP and MySQL on conventional shared hosting.

## Services

| Service | Purpose | Local exposure |
|---|---|---|
| `web` | Nginx same-origin entry point and Vite websocket proxy | `http://localhost:8080` |
| `frontend` | Node 22, pnpm 11.21.0, Vite development server with HMR | Internal only through `web` |
| `app` | PHP 8.3-FPM and Laravel 12 API | Internal only through `web` |
| `mysql` | MySQL 8.4 with `utf8mb4` and a dedicated local AHD user | Internal only |
| `phpmyadmin` | Optional database browser for local development | `http://localhost:8081` with `--profile tools` |

The normal application origin is `http://localhost:8080`. The public website is `/`, the admin is `/admin`, the API is `/api/*`, and public local media is `/storage/*`. Nginx does not expose `.env`, private storage, `vendor`, or application internals.

## First start

From the repository root, run:

```bash
docker compose up -d --build
docker compose ps
```

The first build downloads the PHP/Composer and Node/pnpm dependencies into Docker image layers. The Laravel vendor and storage data use named volumes; the MySQL data uses `ahd_mysql_data`. The frontend source is mounted while its dependency tree remains image-managed, and startup performs a frozen offline workspace-link step from the cached image store. On startup, the `app` service waits for the MySQL healthcheck, creates a local `APP_KEY` in the ignored `laravel-api/.env` if one is not present, runs the current Laravel migrations, and runs the idempotent local admin bootstrap.

To use explicit local values instead of the documented development defaults, copy the template and edit only this ignored file:

```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up -d --build
```

The template values are disposable development values and are not production credentials. Do not commit `.env.docker`, `laravel-api/.env`, generated keys, passwords, database dumps, or real data.

## URLs

| Use | URL |
|---|---|
| Public website | <http://localhost:8080/> |
| Admin | <http://localhost:8080/admin> |
| API health | <http://localhost:8080/api/healthz> |
| API readiness | <http://localhost:8080/api/readyz> |
| Optional phpMyAdmin | <http://localhost:8081> |

The frontend uses `VITE_API_URL=/api/v1`, so the browser keeps one same-site origin and Laravel receives the admin HTTP-only cookie from the same host.

## Local admin setup

The first-start bootstrap reads `AHD_ADMIN_NAME`, `AHD_ADMIN_EMAIL`, and `AHD_ADMIN_PASSWORD` from the Docker Compose environment. With no `.env.docker`, the intentionally obvious development-only defaults are `AHD Local Admin`, `admin@ahd.local`, and `change-me-local-only`. Set your own local values in the ignored `.env.docker` before the first start when desired.

The existing `DatabaseSeeder` is idempotent, hashes the password with Laravel, explicitly assigns `SUPER_ADMIN`, and is guarded to `local` and `testing` environments. It does not silently create an administrator in production. Re-running the normal startup updates the configured local admin rather than creating duplicates.

## Common Docker-native commands

All runtime commands are executed inside containers:

```bash
# Laravel

docker compose exec app php artisan migrate
docker compose exec app php artisan migrate:status
docker compose exec app php artisan test
docker compose exec app php artisan route:list --path=api

# Frontend quality commands (the repository scripts, through Docker)
docker compose exec frontend pnpm lint
docker compose exec frontend pnpm typecheck
docker compose exec frontend pnpm test
docker compose exec frontend pnpm build

# If pnpm 11 requests a workspace dependency reconciliation in a constrained
# environment, use the already-installed image binaries without any host runtime:
docker compose exec frontend node /workspace/node_modules/.bin/eslint .
docker compose exec frontend node /workspace/node_modules/.bin/tsc --build
docker compose exec frontend node /workspace/node_modules/tsx/dist/cli.mjs --test /workspace/scripts/src/*.test.ts
docker compose exec frontend node /workspace/node_modules/vite/bin/vite.js build --config /workspace/artifacts/khadematy-site/vite.config.ts

# Logs
docker compose logs -f
docker compose logs -f app
docker compose logs -f frontend
docker compose logs -f mysql
docker compose logs -f web
```

The frontend source is mounted into the container. Changes under `artifacts/khadematy-site`, `lib`, and related workspace paths are reflected without rebuilding. Vite HMR is proxied through Nginx. If Docker Desktop or WSL2 does not deliver filesystem events reliably, set `CHOKIDAR_USEPOLLING=true` in `.env.docker` and restart the stack.

## Database and persistence

MySQL uses the named volume `ahd_mysql_data`. The application connects to the Compose service name `mysql`, never to `127.0.0.1` from inside the Laravel container. The database is not exposed on a host port by default.

The normal stop command is safe:

```bash
docker compose down
```

`docker compose down` removes containers and networks but **keeps the MySQL data volume**. Start again with `docker compose up -d` to verify the migration state, local admin, and synthetic records remain.

The destructive reset command is explicit:

```bash
docker compose down -v
docker compose up -d --build
```

`docker compose down -v` deletes the local MySQL and dependency volumes. Use it only for a disposable clean-slate test. Never aim it at external, staging, or production infrastructure; this Compose file has no production database connection.

## Local storage and media

Laravel writes local public media to the persistent `ahd_laravel_storage` volume at `storage/app/public`. Nginx mounts that volume read-only and serves it under `/storage/`. Private storage is not mounted into Nginx. The API's ownership, MIME, size, visibility, and worker checks remain server-side. S3 is not required for local Docker development; production may continue to use the configured shared-host local/public disk or optional S3-compatible storage.

The Docker topology serves the public disk through an Nginx alias, so `storage:link` is not required for the normal Docker path. The standard Laravel `php artisan storage:link` remains available for other local or production serving arrangements.

## Optional database UI

phpMyAdmin is not required by AHD. Start it only when needed:

```bash
docker compose --profile tools up -d
```

Then open <http://localhost:8081> and use host `mysql`, user `ahd`, and the local password from `.env.docker` or the documented default. Do not include phpMyAdmin in production deployment documentation.

## Clean local verification sequence

For a disposable local verification, use the following sequence. It is intentionally not destructive to any external database:

```bash
docker compose down -v
docker compose up -d --build
docker compose ps
curl --fail http://localhost:8080/api/readyz
```

Then use the admin UI to log in, create a synthetic worker, add nationality and skills, upload a synthetic local image, set availability, publish, open the public catalogue and profile, and inspect the specific-worker WhatsApp preview. From the landing page, run matching Step 1 and Step 2 and inspect the WhatsApp preview. Do not send a message.

To verify volume persistence, create synthetic data, run `docker compose down`, start with `docker compose up -d`, and verify the migration state, admin login, records, and application routes still work. Finally, repeat `docker compose down -v` followed by `docker compose up -d --build` and verify clean initialization. Remove all synthetic fixtures after verification.

## Production boundary

> **Local:** Docker Compose, Nginx, PHP-FPM, Node/Vite, and MySQL containers.
>
> **Production:** conventional/shared PHP hosting with Laravel's `public/index.php`, MySQL, and the React static build. Production does not require Docker, Node, Redis, queues, long-running workers, or this Compose file.

The local environment proves containerized developer ergonomics only. It does not prove the availability, permissions, HTTPS, cookie security, PHP extensions, persistent storage, S3 credentials, backup/restore, or domain configuration of an external shared-hosting account.
