# Historical and Superseded Artifacts

This document prevents preserved files from being mistaken for current production authority. Historical files remain available for comparison, rollback, or design context unless explicitly removed in a later change.

| Artifact | Classification | Rule |
|---|---|---|
| `laravel-api` | **Current backend authority** | Laravel 12, MySQL migrations, Eloquent models, API routes, middleware, and tests. |
| `artifacts/khadematy-site` | **Current frontend authority** | Maintained React 19/Vite public and admin UI; the path name is legacy only. |
| `artifacts/api-server` | **Superseded backend reference** | Former Express 5 API; useful for parity comparison and rollback history, not current deployment. |
| `lib/db` and `db/migrations` | **Superseded PostgreSQL reference** | Former declarations/migrations; do not extend for the current production database. |
| `docs/prisma/schema.prisma` | **Historical schema artifact** | Old Prisma model; never runtime authority and not a migration source. |
| `replit.md` | **Historical scaffold notice** | Preserved only to explain the original Replit-derived setup; commands are not current instructions. |
| `artifacts/mockup-sandbox` | **Historical prototype** | Visual/prototype artifact, not the production UI or API. |
| `khadematy-local.zip` | **Historical archive** | Preserved local archive; do not extract or treat as current source without explicit review. |
| `Khadematy`/`khadematy` path names | **Legacy naming** | Do not infer current product branding or architecture from filesystem names. |

The active source-of-truth order is defined in `README.md` and `AGENTS.md`. Historical artifacts must not reintroduce Next.js, NestJS, Prisma runtime assumptions, PostgreSQL deployment instructions, CRM/leads, queues, or unsupported commercial scope.
