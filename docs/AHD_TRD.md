# AHD Technical Requirements Document

## Current Technical Authority

The current production target is a static React/Vite frontend served with a Laravel 12 REST API on PHP 8.2+ and MySQL 8-compatible hosting. The existing Express/PostgreSQL stack is preserved only as the behavioral reference and rollback comparison; it is no longer the current architecture.

| Layer | Required implementation |
|---|---|
| Frontend | React 19, TypeScript, Vite, wouter, Tailwind CSS, Arabic RTL; static build output. |
| API | Laravel 12 routes under `/api`, JSON envelopes `{ data: ... }`, request validation, middleware, Eloquent models. |
| Database | MySQL, `utf8mb4`, foreign keys, unique public code/slug, indexed publication/availability filters, Laravel-native migrations. |
| Auth | Password hash verification, opaque random token, SHA-256 token hash in `admin_sessions`, HTTP-only cookie, expiry and logout invalidation. |
| Authorization | Server-side role middleware for `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `CONTENT_MANAGER`, and `ANALYST` capabilities. |
| Media | Laravel Filesystem with controlled local/public disk for shared hosting and optional S3-compatible disk; MIME, size, HTTPS/ownership checks. |
| Validation | Laravel backend validation is authoritative; existing frontend Zod validation remains for UX and WhatsApp message construction. |
| Audit | Important admin mutations create `audit_logs` records without exposing audit data publicly. |

## Domain Model

The active MySQL schema contains `admin_users`, `admin_sessions`, `nationalities`, `skills`, `workers`, `worker_skills`, `worker_media`, `content_blocks`, `system_settings`, and `audit_logs`. Worker availability values are `AVAILABLE`, `ON_HOLD`, `RESERVED`, `TRANSFER_IN_PROGRESS`, `TRANSFERRED`, and `UNAVAILABLE`. Publication values are `DRAFT`, `PUBLISHED`, and `ARCHIVED`.

No `leads`, CRM tables, `MatchingRequest` persistence, queue tables, Redis, BullMQ, booking tables, accounts, or payment tables are permitted in the MVP schema.

## Database Lifecycle

`laravel-api/database/migrations` is the production schema authority. Deployment must run `php artisan migrate --force` before traffic. Runtime HTTP requests never create schema. Migrations must be idempotently tracked by Laravel, use foreign keys and reversible operations where safe, and be verified against disposable real MySQL rather than SQLite.

## API Boundaries

Public routes are read-only and return DTOs that omit internal notes, audit metadata, private media, and admin-only fields. Admin routes require the opaque session cookie and role authorization. Worker creation/update plus skill relationship changes occur inside `DB::transaction` so a failed relationship mutation cannot leave a partial write.

Customer conversion remains frontend-only temporary state: form validation → pure message builder → trusted configured WhatsApp URL. Laravel exposes public contact settings but does not persist customer form submissions.

## Shared-Hosting Topology

The preferred same-site topology is:

```text
https://domain/       → built React static assets
https://domain/api/*  → Laravel public/index.php
```

The web document root must expose only the intended Laravel `public` entry point and static frontend assets. `.env`, source, `vendor`, private storage, and database configuration must remain outside direct web access. Production must not require Node, Docker, Redis, long-running workers, WebSockets, or microservices.

## Configuration Requirements

Production requires `APP_ENV=production`, `APP_DEBUG=false`, a real `APP_KEY`, MySQL credentials, secure HTTPS cookies, an explicit origin allowlist, writable Laravel cache/log/storage directories, and a persistent local/public or approved S3-compatible media disk. The intended host's PHP version, extensions, HTTPS/domain, storage, and permissions remain environment-dependent release checks.

## Verification Status

The Laravel package has passed PHP syntax checks, MySQL fresh migration, idempotent rerun, route inspection, six feature tests with 48 assertions, API CRUD/public/privacy smoke, React lint/typecheck/tests/build, and browser golden slices using disposable Arabic fixtures. Real shared-hosting deployment and external S3 retrieval remain separate environment checks.
