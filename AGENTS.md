# AHD Agent Operating Contract

## Read Order

Before modifying the repository, read `README.md`, `docs/PRODUCT.md`, `docs/AHD_BRD.md`, `docs/AHD_TRD.md`, `docs/ARCHITECTURE.md`, `docs/HISTORICAL_ARTIFACTS.md`, and the relevant API/security/testing documents. `CODEX_MEMORY.md` records durable verified state but never overrides code or the current canonical docs.

## Current Authority

The maintained frontend is `artifacts/khadematy-site`. The current backend authority is `laravel-api`: Laravel 12, PHP 8.2+, MySQL, Eloquent, Laravel migrations, API middleware, opaque admin sessions, and shared-hosting media support. The Express/PostgreSQL implementation is superseded reference material and must not receive new production features.

## Product Guardrails

Preserve the existing React/Vite UI and WhatsApp-first MVP. Do not add CRM, leads, customer or worker accounts, bookings, payments, marketplace chat, queues, Redis, BullMQ, government integrations, or background processing. Customer requests remain temporary frontend state and are never persisted as lead records.

## Implementation Rules

Use the existing API field/envelope contract so the frontend needs no redesign. Use Laravel request validation, server-side role middleware, Eloquent relationships, `DB::transaction` for worker-plus-skill writes, explicit public DTOs, MySQL foreign keys/indexes, and versioned migrations. Keep admin session tokens opaque and hashed. Keep media policies strict and distinguish local public-disk behavior from production HTTPS/S3 verification.

## Verification Before Done

Run PHP syntax checks, fresh and idempotent MySQL migrations, `php artisan migrate:status`, `php artisan test`, and `php artisan route:list --path=api`. Also run `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `PORT=3001 BASE_PATH=/ pnpm build`, and `pnpm audit --audit-level=high`. For relevant UI changes, run browser golden slices and save durable findings. Never claim shared-hosting readiness without an authorized target.

## Data and Git Hygiene

Use only disposable synthetic fixtures for local testing; remove them after verification. Never commit `.env`, passwords, tokens, customer data, full WhatsApp messages, generated vendor files, or private media. Review `git diff --check`, stale architecture/scope scans, and changed paths before committing. Update canonical docs and `CODEX_MEMORY.md` whenever runtime authority changes.
