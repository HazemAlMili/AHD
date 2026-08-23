# AHD Acceptance Criteria

## Product and UI

The existing React/Vite public and admin UI remains the product surface. Arabic RTL, catalogue search/filtering, worker profile, specific-worker form, two-step matching form, truthful invalid/refresh states, admin login, and operational navigation must render without scope or redesign changes.

## Backend and Database

The Laravel API must pass PHP syntax checks, `php artisan route:list --path=api`, fresh MySQL migration, idempotent migration rerun, readiness, feature tests, and the API golden slice. MySQL must use the active Laravel migration and Eloquent model set; the old PostgreSQL migration is not an authority.

## Admin Operations

A disposable admin can log in, receive an opaque HTTP-only session, read session state, create/update a worker, assign skills, publish/unpublish/archive, update availability, manage taxonomies/content/settings, upload or save approved media, delete owned media, and create audit records. Missing auth, insufficient roles, invalid input, unsafe media, and cross-worker media access must fail safely.

## Public Behavior

Only approved public workers appear in the catalogue and profile route. Public DTOs omit internal notes, audit metadata, private media, admin identifiers, and credentials. Public settings expose only approved contact values. No customer form creates a database row.

## Conversion Behavior

The specific-worker and matching forms must validate required fields, use trusted worker/configuration data, URL-encode Arabic content safely, and open a WhatsApp preview. Automated verification must not send a message or continue into WhatsApp Web. No lead, CRM, queue, booking, account, or payment endpoint may be introduced.

## Release Classification

**PASS WITH EXTERNAL HOSTING CHECKS** applies when the repository and disposable MySQL gates pass but the intended shared host has not yet verified PHP extensions, document-root isolation, HTTPS/secure cookies, production MySQL, persistent media upload/retrieval, cache/storage permissions, backups, and real domain/origin allowlisting. **PRODUCTION READY** requires all of those external checks on the authorized target.
