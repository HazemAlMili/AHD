# AHD (عهد) — Technical Requirements Document

**Version:** 2.0 — Simplified CRUD + WhatsApp MVP

## 1. Objective
Build:
- public Next.js website
- admin Next.js backoffice
- NestJS REST API
- PostgreSQL/Prisma catalogue
- object storage for media
- client-side WhatsApp form handoff
- basic analytics

Do not build a custom CRM in MVP.

## 2. Stack
- Next.js + React + TypeScript
- Tailwind CSS + accessible UI primitives
- NestJS + REST/OpenAPI
- PostgreSQL + Prisma
- S3-compatible object storage
- PostHog/equivalent analytics
- Sentry
- Playwright + axe
- pnpm + Turborepo
- Docker + GitHub Actions

Redis/BullMQ are deferred until a real need appears.

## 3. Architecture
```text
Public Next.js
  ├─ GET catalogue/content/settings from API
  └─ validate form → build WhatsApp URL → open WhatsApp
          │
NestJS API
          │
PostgreSQL + Object Storage

Admin Next.js
          │
same NestJS API
```

## 4. MVP Backend Modules
```text
AuthModule
AdminUsersModule
WorkersModule
NationalitiesModule
SkillsModule
MediaModule
ContentModule
SettingsModule
AuditModule
```

Future only if needed:
`SearchModule, LeadsModule, NotificationsModule, IntegrationsModule`

## 5. Core DB Entities
```text
AdminUser
Worker
Nationality
Skill
WorkerSkill
WorkerMedia
ContentBlock
SystemSetting
AuditLog
```

No Lead/CRM tables in MVP.

## 6. Public API
```http
GET /api/v1/workers
GET /api/v1/workers/:slug
GET /api/v1/nationalities
GET /api/v1/skills
GET /api/v1/content/:key
GET /api/v1/public-settings
```

Public settings can expose approved contact values such as WhatsApp number.

## 7. Admin API
```http
GET/POST/PATCH /api/v1/admin/workers
POST /api/v1/admin/workers/:id/publish
POST /api/v1/admin/workers/:id/unpublish
POST /api/v1/admin/workers/:id/archive
PATCH /api/v1/admin/workers/:id/availability

GET/POST/PATCH /api/v1/admin/nationalities
GET/POST/PATCH /api/v1/admin/skills
GET/PATCH /api/v1/admin/content/:key
GET/PATCH /api/v1/admin/settings/:key
```

## 8. WhatsApp Architecture
No public `POST /leads` is required.

Flow:
```text
Form local state
→ shared validation
→ reusable message builder
→ non-PII analytics event
→ URL encode
→ open configured WhatsApp destination
```

Do not persist form PII in localStorage/sessionStorage by default.

## 9. WhatsApp Builders
Create reusable tested utilities:
```text
buildWorkerRequestMessage()
buildMatchingRequestMessage()
buildWhatsAppUrl()
```

Specific-worker request uses worker public code from trusted API data.

Matching request uses:
- city
- urgency
- needs[]
- language optional
- Saudi-experience preference optional
- nationality preference optional/approved
- readiness
- name
- mobile if required

## 10. Worker Rules
Publication:
`DRAFT | PUBLISHED | ARCHIVED`

Availability:
`AVAILABLE | ON_HOLD | RESERVED | TRANSFER_IN_PROGRESS | TRANSFERRED | UNAVAILABLE`

Request CTA enabled only when published + available.

## 11. Validation
Shared schemas in `packages/validation`.

Backend remains authoritative for CRUD.
Client validation is authoritative only for whether the local WhatsApp form is ready to open WhatsApp.

## 12. Analytics
Events:
```text
worker_listing_viewed
worker_profile_viewed
worker_request_started
worker_whatsapp_clicked
transfer_lp_viewed
matching_cta_clicked
matching_form_started
matching_step_1_completed
matching_step_2_completed
matching_whatsapp_clicked
phone_clicked
```

Never send name, phone, free-text note, or private worker data to analytics.

## 13. Security
- secure admin sessions
- server-side RBAC
- safe file uploads
- explicit public DTOs
- trusted configurable WhatsApp number
- URL-encode message
- never allow public query params to override WhatsApp destination
- no PII analytics

## 14. Content
Admin can manage structured homepage/LP/FAQ/contact content.

No arbitrary script injection.

## 15. Search
Start with PostgreSQL filtering/indexes.
Use pg_trgm only if needed.
No dedicated search engine in MVP.

## 16. Caching
Start without Redis cache unless measured need appears.
Use CDN and Next.js revalidation where safe.
Status/publication updates must invalidate relevant public content.

## 17. Performance
- Server Components by default
- minimal hydration
- optimized responsive images
- no heavy autoplay media
- limited third-party scripts
- lightweight forms

## 18. Accessibility
Target WCAG 2.2 AA for catalogue, profile, filters, WhatsApp forms, FAQ, and admin CRUD.

## 19. Scaling
Keep web/API stateless.
Use object storage/CDN.
Use DB connection pooling in scalable production.
Scale DB through indexes/query optimization/stronger tiers/read replicas before sharding.
Add Redis/queues/CRM only when justified.

## 20. Testing
Unit:
- publication/requestability
- validation
- WhatsApp builders
- permissions

Integration:
- CRUD
- taxonomy relations
- settings
- public DTO privacy

E2E:
```text
Admin creates/publishes worker
→ worker appears publicly

Worker profile
→ form
→ correct WhatsApp URL

Paid LP
→ Step 1
→ Step 2
→ correct WhatsApp URL
```

## 21. Technical Acceptance
- Admin CRUD works
- catalogue is DB-driven
- public settings configure WhatsApp
- no custom CRM required
- correct message generation
- no PII in analytics
- mobile/accessibility/performance baseline passes
- horizontal scaling remains possible
