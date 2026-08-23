# AHD (عهد) — Technical Requirements Document

**Version:** 3.0 — Verified React/Vite + Express + PostgreSQL MVP

## 1. Objective

The system provides a public React/Vite website, a protected admin interface, and an Express API backed by PostgreSQL. Customers discover approved worker information or describe a household need; the frontend validates a short form and opens a structured WhatsApp URL. Sales and operations continue outside the website.

## 2. Verified Stack

| Concern | Current implementation |
|---|---|
| Public/admin UI | React 19, TypeScript, Vite, wouter, Tailwind CSS, Lucide primitives |
| HTTP API | Express 5 |
| Validation | Zod, including shared `lib/api-zod` domain utilities |
| Database | PostgreSQL, parameterized `pg` repository queries |
| Schema declarations | Drizzle schema/type declarations in `lib/db` where applicable |
| Migrations | Versioned SQL in `db/migrations`, executed through `pnpm db:migrate` and inspected with `pnpm db:status` |
| Authentication | scrypt password verification, opaque session token, SHA-256 token hash, HTTP-only cookie |
| Media | S3-compatible presigned uploads with type/size, HTTPS, public-URL, and worker-ownership controls |
| Quality | ESLint, TypeScript, Node tests, production builds, dependency audit, GitHub Actions, browser/axe audit |

The historical Prisma/NestJS/Next.js description is superseded and is not the current runtime architecture. `docs/prisma/schema.prisma` is retained only as a historical reference.

## 3. Conceptual Architecture

```text
Public React/Vite App
        │
        ▼
Express Public Read API
        │
        ▼
PostgreSQL

Admin React/Vite Interface
        │
        ▼
Protected Express Admin API
        │
        ▼
PostgreSQL

Approved Worker Media → S3-Compatible Object Storage

Customer Forms → Zod validation → non-PII event → WhatsApp URL
```

PostgreSQL is the business source of truth. Public and admin surfaces share the API but use separate route and authorization boundaries. Customer request forms remain temporary frontend state; they are not persisted as leads. The API and frontend are stateless with respect to customer submissions.

## 4. Database Lifecycle

Production traffic must run only against a migrated schema. The migration runner loads versioned SQL, applies each migration transactionally, records a SHA-256 checksum, uses an advisory lock, supports safe idempotent reruns, and can adopt a compatible existing schema. Deployment order is:

```text
configure DATABASE_URL
→ pnpm db:status
→ pnpm db:migrate
→ start API traffic
```

Request-time schema creation is retained only as a local-development/test convenience where explicitly enabled; it is not the production lifecycle.

## 5. Domain Model

The active database entities are admin users, workers, nationalities, skills, worker-skill relations, worker media, content blocks, system settings, audit logs, and migration metadata. There is no active Lead, CRM, queue, or matching-request persistence model.

Workers use publication states `DRAFT`, `PUBLISHED`, and `ARCHIVED`. Availability states are `AVAILABLE`, `ON_HOLD`, `RESERVED`, `TRANSFER_IN_PROGRESS`, `TRANSFERRED`, and `UNAVAILABLE`. Public requestability is derived from the backend’s publication and availability rules.

## 6. Validation and Handoff

The backend is authoritative for admin CRUD, publication, availability, permissions, and public DTO projection. The frontend uses shared Zod schemas to decide whether a local WhatsApp form is ready to open the handoff. Pure helpers build worker and matching messages and normalize the trusted destination before URL encoding.

```text
temporary form state
→ shared validation
→ pure message builder
→ non-PII analytics event
→ encoded configured WhatsApp URL
```

No public request endpoint such as `POST /leads` or `POST /leads/matching` exists in the current MVP.

## 7. Media

The admin API supports URL media and S3-compatible presigned upload preparation. Binary uploads are constrained by approved MIME types and size limits. Public media must use approved HTTPS/public URLs. Media update/delete operations verify that the media belongs to the requested worker.

## 8. Analytics

Current event names include `worker_listing_viewed`, `worker_profile_viewed`, `worker_request_started`, `worker_whatsapp_clicked`, `transfer_lp_viewed`, `matching_cta_clicked`, `matching_form_started`, `matching_step_1_completed`, `matching_step_2_completed`, `matching_whatsapp_clicked`, and `phone_clicked`. Properties may contain approved public worker references or safe counts, but never customer name, phone, email, free-text note, full message, or private worker data.

## 9. Security and Operations

Admin routes require an authenticated session and role enforcement. Public DTOs are explicit projections. SQL is parameterized. Zod validates admin and public inputs. CORS uses an explicit origin allowlist with credential support where configured. Production cookies are HTTP-only and use secure deployment settings. The configured WhatsApp destination is trusted application data, not a public query-parameter override.

Liveness is `GET /api/healthz` and is dependency-light. Readiness is `GET /api/readyz` and verifies database/migration readiness. Environment-dependent production checks still require a real HTTPS staging topology and configured object storage.

## 10. Quality Requirements

Every change must preserve the repository gates: lint, typecheck, unit tests, build, dependency audit, and CI. Browser verification uses the repository axe/layout audit where a CDP session is available. The target is WCAG 2.2 AA for public catalogue/profile/forms, matching, and admin CRUD.

## 11. Scale Boundaries

The current system is a stateless web/API application backed by PostgreSQL and object storage. Start with PostgreSQL filtering and indexes, CDN/object storage, and connection-pool-aware deployment. Redis, queues, CRM, dedicated search, microservices, Kafka, Kubernetes, or framework migration are not required unless a measured operational requirement creates a separate approved architecture change.
