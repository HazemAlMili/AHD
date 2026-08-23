# AHD Architecture

## Target Topology

```text
Browser
  │
  ├── https://domain/       → static React/Vite assets
  └── https://domain/api/*  → Laravel public/index.php
                                  │
                                  ▼
                              MySQL
                                  │
                                  ▼
                    local/public or S3-compatible media disk
```

The frontend remains the existing React/Vite application. Laravel owns API behavior, authentication, authorization, validation, Eloquent persistence, transactions, migrations, media metadata, content, settings, and audit records. MySQL is the production data authority.

## Boundaries

Public Laravel routes are read-only and expose explicit DTOs. Admin routes require a server-validated opaque session cookie and role middleware. The public and admin surfaces use the same current React UI but different API boundaries. The browser never chooses the trusted WhatsApp destination.

Customer forms are intentionally not backend resources. The frontend keeps form state temporarily, validates it with shared Zod helpers, builds a message, tracks only approved non-PII events, and opens a trusted WhatsApp URL. There is no lead, customer, matching-request, CRM, queue, or booking subsystem.

## Data Flow

Admin worker/taxonomy/content/settings changes are validated by Laravel, applied through Eloquent and MySQL transactions, and audited. A worker's skill pivot is updated within the same transaction as worker create/update. Publication and availability determine public visibility/requestability. Public responses are projections that exclude internal notes, audit metadata, private media, and admin-only fields.

Media uses Laravel Filesystem. Conventional shared hosting may use a persistent local/public disk with a protected storage link; an approved S3-compatible disk can be selected through configuration without changing domain behavior. Uploads validate ownership, MIME type, size, and safe storage paths.

## Shared-Hosting Requirements

The document root must map to the intended Laravel `public` directory or an explicitly integrated public structure. `.env`, `vendor`, storage private files, database configuration, and source must not be web-accessible. Production requires PHP 8.2+, Composer-installed dependencies, `pdo_mysql`, `mbstring`, `xml`, `curl`, and `zip`, standard HTTPS, writable cache/log/storage directories, `APP_DEBUG=false`, secure cookies, and a real `APP_KEY`.

Production traffic must not depend on Node, Docker, Redis, BullMQ, queue workers, WebSockets, Kafka, Kubernetes, or microservices. Frontend assets are built once and served statically. Laravel migrations run through `php artisan migrate --force` before traffic.

## Historical Reference

The Express/PostgreSQL application was the verified behavioral reference used to implement this pivot. It is retained for comparison and rollback history only. The Laravel/MySQL package is the current architecture; old PostgreSQL migrations and Express routes must not be treated as production authority.
