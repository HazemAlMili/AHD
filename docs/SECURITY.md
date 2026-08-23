# AHD Security Baseline

## Verified Controls

Laravel admin routes require a server-side session lookup. Login stores only a SHA-256 hash of an opaque random token in `admin_sessions`; the token is delivered through an HTTP-only cookie with expiry and logout invalidation. Production configuration must set Secure cookies over HTTPS and an appropriate SameSite policy.

Role middleware enforces `SUPER_ADMIN`, `ADMIN`, `OPERATIONS`, `CONTENT_MANAGER`, and `ANALYST` boundaries on the server. Frontend hiding is not an authorization boundary. Worker and skill mutations run in database transactions. Laravel validation is authoritative for admin writes.

Public routes are read-only and use explicit DTO projections. Internal notes, audit metadata, private media, admin credentials, session tokens, and database-only fields are not returned publicly. Public input cannot override the trusted WhatsApp destination. Customer form data is not persisted as leads or CRM records, and analytics excludes customer name, phone, email, free-text notes, and full messages.

MySQL uses `utf8mb4`, foreign keys, unique public code/slug constraints, and indexed public filters. Migrations run explicitly with `php artisan migrate --force`; HTTP requests never create schema. Media validates MIME type, size, worker ownership, safe storage paths, and HTTPS for production public URLs. Local development may use controlled `/storage/...` paths only in `APP_ENV=local`.

CORS must use an explicit `AHD_ALLOWED_ORIGINS` allowlist. Wildcard origin is not compatible with credentialed cookies. `APP_DEBUG=false`, secret values outside Git, and a real production `APP_KEY` are required.

## Environment-Dependent Release Checks

The repository cannot prove the intended shared-hosting document-root mapping, PHP configuration, permissions, HTTPS certificate/domain, secure-cookie behavior behind the host proxy, persistent media retrieval, or production backup/restore. These checks require an authorized staging or production-like hosting account.

Before launch, confirm that only Laravel's intended public entry point and built static assets are web-accessible; `.env`, `vendor`, private storage, source, database configuration, and logs must not be exposed. Confirm MySQL credentials use a least-privilege account, storage is persistent, public media is retrievable over HTTPS, and the actual domain/origin is in the allowlist.

## Incident and Scope Guardrails

Do not add CRM, leads, queues, Redis, BullMQ, customer accounts, payment data, or message persistence to solve an operational problem without an explicit product and security review. Do not place credentials, customer data, test passwords, or full WhatsApp messages in logs, fixtures, reports, or committed files.
