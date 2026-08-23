# AHD Execution Plan

## Completed Baseline

The original React/Vite plus Express/PostgreSQL MVP was hardened, staged against disposable PostgreSQL, documented, and pushed. It remains the behavioral reference only.

## Completed Architecture Pivot

The current backend has been implemented under `laravel-api` as Laravel 12/PHP 8.2+ with MySQL migrations, Eloquent models, route middleware, opaque admin sessions, RBAC, public/admin DTOs, transactions, audit records, local/public media handling, optional S3-compatible configuration, and CORS.

The existing React/Vite frontend consumes the same `/api/v1` contract without UI redesign. CamelCase payload compatibility is normalized at the Laravel boundary. No product scope was added.

## Verified Gates

Disposable MySQL passed fresh migration, idempotent rerun, status inspection, Arabic fixture seeding, Laravel feature tests, API health/readiness, auth/session, worker lifecycle, public privacy, settings/content, media validation/ownership/upload, and audit assertions. React lint, typecheck, test, build, and high-severity audit also pass; seven established Fast Refresh warnings and the known tooltip source-map warning are non-fatal.

Browser golden slices passed the Laravel-backed catalogue/profile and specific-worker WhatsApp preview, matching two-step WhatsApp preview, and admin login/dashboard listing. No WhatsApp message was sent.

## Shared-Hosting Release Sequence

1. Obtain an authorized shared-hosting account and create a least-privilege MySQL database.
2. Confirm PHP version/extensions, Composer availability, writable Laravel directories, HTTPS/domain, and document-root isolation.
3. Configure secrets outside Git: `APP_KEY`, `APP_ENV`, `APP_DEBUG=false`, MySQL, session/cookie, CORS, admin bootstrap, and media disk.
4. Build React assets with same-site `VITE_API_URL=/api/v1` and publish them using the intended host layout.
5. Deploy Laravel's `public` entry point and run `php artisan migrate --force`, cache commands, and `storage:link` where local storage is selected.
6. Verify health/readiness, admin login, CRUD/publish/public propagation, media upload/public retrieval, secure cookies, CORS, and both WhatsApp previews on the real domain.
7. Remove all synthetic fixtures, verify backups/restore, then classify production readiness.

## Remaining Blockers

No authorized shared-hosting target, production-like HTTPS domain, or real object-storage account is available in the repository environment. Therefore the migration is **repository and disposable-MySQL verified, but not production-host verified**. Do not claim final production readiness until the external sequence passes.
