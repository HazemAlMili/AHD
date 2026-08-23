# AHD Testing Strategy

## Required Gates

The React repository gates remain:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
PORT=3001 BASE_PATH=/ pnpm build
pnpm audit --audit-level=high
```

The Laravel backend gates are:

```bash
cd laravel-api
composer install
find app database/migrations database/seeders routes bootstrap tests -name '*.php' -print0 | xargs -0 -n1 php -l
php artisan migrate:fresh --force
php artisan migrate --force
php artisan migrate:status
php artisan test
php artisan route:list --path=api
```

Laravel verification must use disposable MySQL, not SQLite, because foreign keys, JSON, indexes, collations, and MySQL behavior are part of the production contract.

## Backend Coverage

The Laravel feature suite covers liveness/readiness, public taxonomy and worker visibility, admin login/session, worker lifecycle, publication, availability, public DTO privacy, settings, localized content, invalid media URLs, local-disk upload, media ownership, deletion, and audit records. Worker create/update and skill pivot writes are transaction-protected.

## Browser Golden Slices

The verified local browser slices are:

1. Open the React/Vite catalogue backed by Laravel, inspect a published worker profile, fill the specific-worker form with synthetic values, and confirm WhatsApp displays a structured preview without sending.
2. Complete matching Step 1 and Step 2 with synthetic answers and consent, then confirm WhatsApp displays the structured matching preview without sending.
3. Log into the admin UI with a disposable local account and confirm the dashboard lists the seeded and API-created worker records.

The frontend and API must use the same site host in local testing (`localhost` on both sides) so the HTTP-only cookie is not misdiagnosed as an application failure due to a 127.0.0.1/localhost host mismatch.

## Security Checks

Verify unauthenticated admin routes return `401`, insufficient roles return `403`, public mutation attempts are rejected, unsafe/oversized media is rejected, cross-worker media IDs return `404`, public DTOs exclude internal fields, and no customer submission creates a database row. Verify CORS with explicit allowlisted origins and credentials.

## Environment-Dependent Checks

An authorized shared-hosting or staging environment must additionally verify PHP version/extensions, document-root isolation, HTTPS and secure cookies, real MySQL connectivity, persistent local/S3-compatible media upload and public retrieval, cache/storage permissions, backup/restore, and the configured domain/origin. Local disposable MySQL and WhatsApp preview pages do not prove those release checks.

## Data Hygiene

Use unmistakable synthetic fixtures, keep credentials in ignored local files or environment variables, never commit test passwords, and delete all synthetic workers, sessions, media, settings, content, and admin records after a run against a disposable database.
