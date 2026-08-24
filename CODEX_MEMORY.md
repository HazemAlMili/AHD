# AHD — Codex Project Memory

> **CRITICAL — DO NOT REGRESS**
>
> AHD MVP = **Admin CRUD + Public Worker Catalogue + Specific Worker WhatsApp Form + Need-Based Matching WhatsApp Form**.
>
> AHD MVP is **not** a CRM, lead pipeline, customer-account system, booking platform, payment platform, or general home-service marketplace.
>
> Do not introduce Lead persistence, `POST /leads`, Redis/BullMQ, or distributed infrastructure without a new approved scope decision.

## 1. Project Identity

- Product: **AHD / عهد**.
- Primary market: Saudi Arabia.
- Domain: domestic-worker discovery and sponsorship/service-transfer request experience.
- Approved public worker-reference convention: `AHD-XXXX` (for example, `AHD-1024`). Do not use legacy worker-reference prefixes or stale product branding in current customer-facing work.
- The repository began from a high-quality Replit-derived frontend prototype. It is not a greenfield redesign target.

## 2. One-Sentence Product Definition

AHD is a Saudi-focused domestic-worker discovery platform where Admin manages worker inventory, customers browse workers or describe their household need, and customer request flows continue through a structured WhatsApp handoff.

## 3. Core MVP Flow

```text
ADMIN
  ↓
Manage Worker Catalogue
  ↓
Publish Worker
  ↓
Public Website
  ↓
Customer browses OR describes a need
  ↓
Simple form + validation
  ↓
Structured WhatsApp message
  ↓
Configured business WhatsApp
  ↓
Sales / Operations continue externally
```

The website does not need an internal CRM to complete this loop.

## 4. Current Project Stage

- Implementation: **completed for the approved MVP slice**.
- Independent QA/correction and repository hardening: **completed and pushed**.
- Laravel/MySQL architecture pivot: **implemented and verified against disposable MySQL**; the React/Vite UI remains unchanged.
- Backend parity: **verified** for health/readiness, auth/session/RBAC, worker/taxonomy/content/settings/media operations, transactions, public DTO privacy, and both WhatsApp journeys.
- Documentation reconciliation: **completed for the Laravel/MySQL pivot and Docker-local development environment**.
- Homepage consolidation and polish: **implemented** — canonical `/` (with `/home` and `/help` redirecting to it), embedded two-step matching inside one `#matching` section with inline step transitions, API-backed worker carousel, simplified logo-only public navbar, and configurable FAQ. Covered by lint/typecheck/unit/build gates and code review; the recorded browser golden slices predate the consolidated Homepage, so re-running them is the standing repo-side follow-up.
- Repository reconciliation: **completed** — stale PostgreSQL root npm aliases removed, unused frontend workspace dependency removed, Laravel queue scaffold dev command removed, admin media-limit copy corrected, footer FAQ navigation targets the real `#faq` section, and the approved optional `age` attribute is exposed in the Admin editor.
- Production readiness: **REPOSITORY READY WITH EXTERNAL HOSTING CHECKS**; Docker-local development was previously verified through the primary same-origin Compose URL during local integration QA.
- Production deployment: **not executed** because no authorized shared-hosting/domain/S3 target or deployment credentials are available.
- Production launch: pending authorized shared-hosting PHP/MySQL/HTTPS/storage verification.

## 5. Current Architecture

Current runtime architecture:

```text
Vite + React public/admin app
  ├─ reads public catalogue/content/settings from API
  ├─ local form state → shared Zod validation
  └─ message builder → encoded WhatsApp URL
        │
Laravel 12 API on PHP 8.2+
  ├─ admin session/RBAC and CRUD
  ├─ explicit public DTOs
  ├─ transactions, audit, settings, and media policy
  └─ `/api/v1` contract preserved for the existing UI
        │
MySQL 8-compatible schema (Laravel migrations + Eloquent)
        │
Local/public Filesystem or optional S3-compatible media disk
```

Historical materials contained Next.js/NestJS/Prisma assumptions, and the prior Express/PostgreSQL application is now superseded reference material. The current authority is React 19/Vite/wouter/Tailwind + Laravel 12/PHP + MySQL/Eloquent. Do not extend the old backend for new production behavior.

Database lifecycle is explicit: `laravel-api/database/migrations` is authoritative and deployment runs `php artisan migrate --force` before traffic. The disposable MySQL migration was applied fresh and rerun idempotently; HTTP requests never create schema.

Architect for scale, deploy for current reality:

- MySQL is the durable business source of truth.
- Keep the web/API tier stateless where practical.
- Use persistent shared-hosting storage or approved object storage for media.
- Do not add Redis, queues, or distributed infrastructure without a separate approved scope decision.

## 6. Backend Scope

The MVP backend is intentionally a simple Admin CRUD backend plus public reads.

Backend owns:

- Admin authentication and server-side authorization.
- Workers and publication/status transitions.
- Nationalities/countries and skills.
- Worker media and upload policy.
- Public content/FAQ blocks.
- Public settings, including the business WhatsApp/contact destination.
- Audit records where implemented.
- Explicit public/private DTO mapping.

Admin owns catalogue mutations. Public users consume only published, approved data. Customer forms do not require backend persistence.

## 7. Admin Responsibilities

Admin is the party that adds and manages domestic workers. Current capabilities include:

- Create, read, and update workers.
- Assign nationality from the taxonomy list (the Laravel boundary also accepts typed `nationalityName` for compatibility) and assign multiple skills.
- Set operational attributes including the optional `age` value validated by Laravel (18–100).
- Manage URL media and the S3-compatible upload flow.
- Change availability.
- Save drafts, publish, unpublish, and archive.
- Feature and order workers where implemented.
- Manage nationalities/countries and skills.
- Manage public content/FAQ blocks.
- Manage WhatsApp and public contact settings.

Routine inventory changes must not require source-code edits. The admin UI is operational and table-oriented; server authorization is authoritative even when the UI hides controls.

## 8. Public Responsibilities

Public customers may:

- Browse published workers.
- Search and filter by nationality, skill, and availability.
- View a worker profile.
- Request a specific worker.
- Submit matching preferences.
- Continue the conversation through WhatsApp.

Public users must not add/edit workers, publish/unpublish/archive, mutate taxonomy, upload/manage media, or change settings. These mutation attempts are server-rejected.

## 9. Worker Catalogue

Public catalogue data is database-backed and explicitly mapped. Public output includes approved display data such as public code, display name, nationality, age, city, experience, languages, skills, availability, summary, featured/order state, and public media.

Never expose internal notes, internal IDs, admin metadata, private/sensitive media, secrets, or operational audit data in public DTOs.

Worker state is two-dimensional:

- Availability: `AVAILABLE`, `ON_HOLD`, `RESERVED`, `TRANSFER_IN_PROGRESS`, `TRANSFERRED`, `UNAVAILABLE`.
- Publication: `DRAFT`, `PUBLISHED`, `ARCHIVED`.

Authoritative visibility/requestability rules:

- `DRAFT`: not active public inventory.
- `ARCHIVED`: not active public inventory.
- Public API returns only `PUBLISHED` workers with an active nationality.
- A worker is normally requestable only when `PUBLISHED + AVAILABLE`; publication and availability remain separate concerns.

## 10. Specific Worker Request Flow

```text
Worker Profile
  → اطلب هذه العاملة
  → Small Request Form
  → Validation
  → buildWorkerRequestMessage()
  → buildWhatsAppUrl()
  → Configured business WhatsApp
```

Current approved fields are name, city, phone, and optional note. Do not invent extra qualification fields. The worker public reference is taken automatically from trusted API data (for example, `AHD-1024`); the customer must not supply or override the authoritative worker identity or destination.

## 11. Paid Matching Flow

```text
Google / high-intent search
  → Transfer Landing Page
  → ابدأ طلب المطابقة
  → Step 1: household need
  → Step 2: contact/readiness
  → Validation
  → Structured WhatsApp message
  → WhatsApp
```

This funnel is **need-based matching first**, not catalogue-first. Catalogue browsing is not required to complete it.

Current fields:

- Step 1: city, urgency, household needs, optional language preference, optional previous Saudi-experience preference.
- Step 2: name, phone, optional nationality preference, readiness, privacy/consent acknowledgement.

No mandatory email and no V1 budget field.

## 12. WhatsApp Architecture

Customer conversion is a client-side handoff, not a lead-record workflow:

```text
Temporary form state
  → shared/client validation
  → reusable message builder
  → non-PII analytics event
  → URL-encoded WhatsApp URL
  → configured WhatsApp destination
```

Current reusable functions are `buildWorkerRequestMessage()`, `buildMatchingRequestMessage()`, and `buildWhatsAppUrl()` in the shared domain package.

Requirements:

- Destination comes from trusted public settings/configuration and is normalized by the builder.
- Messages must handle Arabic, spaces, special characters, and structured answers.
- Worker references come from trusted worker data.
- Public input cannot override the number or authoritative worker reference.
- Do not store form PII in browser persistence by default.

## 13. Current Data Model

The active MySQL schema is defined by `laravel-api/database/migrations/2026_08_23_000000_create_ahd_schema.php` and represented by Eloquent models in `laravel-api/app/Models`. Important entities are `AdminUser`, `AdminSession`, `Worker`, `Nationality`, `Skill`, `WorkerMedia`, `ContentBlock`, `SystemSetting`, and `AuditLog`, plus the worker-skill pivot.

There are no customer, lead, booking, payment, CRM, queue, Redis, or BullMQ entities. Publication and availability remain separate enum-like values as listed above. `docs/prisma/schema.prisma`, `lib/db`, and `db/migrations` are historical/superseded references only.

## 14. Security & Privacy Guardrails

- Backend admin authorization is authoritative; frontend route/control hiding is not security.
- Public mutation attempts must remain denied.
- Public DTOs must explicitly omit private/internal fields.
- Admin sessions use secure token handling and server-side session lookup; production cookies are `httpOnly`, `sameSite`, and `secure`.
- WhatsApp destination is trusted configuration; user input cannot redirect it.
- WhatsApp message text is URL encoded.
- No secrets or database credentials belong in client code, memory, or public DTOs.
- Worker media ownership is enforced on update/delete; cross-worker media modification must remain impossible.
- Unsafe media schemes are rejected; current admin media URL validation requires HTTPS.
- Media upload types and size limits are enforced server-side before presigned upload creation.
- Do not send customer name, phone, email, free-text note, or private worker data to behavioral analytics.
- Do not claim government affiliation, licenses, guarantees, response SLAs, fake reviews/counts, unsupported pricing, or unverified coverage.

## 15. UI / Replit Preservation Rule

The original Replit-derived UI is the approved visual reference. Preserve its:

- Composition and page structure.
- Typography, spacing, colors, radii, shadows, and hierarchy.
- Cards, forms, filters, CTAs, useful motion, and responsive behavior.
- Arabic RTL semantics and mobile-first layouts.

Productionization strategy:

```text
KEEP the good UI
  + connect real APIs/data underneath it
```

Change visual code only for a concrete functional bug, accessibility issue, responsiveness/usability issue, security requirement, performance issue, or explicit design request. Do not flatten or replace polished components for stylistic preference.

## 16. Analytics Rules

The current event allowlist is:

`worker_listing_viewed`, `worker_profile_viewed`, `worker_request_started`, `worker_whatsapp_clicked`, `transfer_lp_viewed`, `matching_cta_clicked`, `matching_form_started`, `matching_step_1_completed`, `matching_step_2_completed`, `matching_whatsapp_clicked`, `phone_clicked`.

The current frontend emits non-PII `ahd:analytics` browser events and filters property keys containing name/phone/note/message/email. If a provider is added later, preserve the allowlist and privacy filter; never pass raw form data.

## 17. Explicit MVP Non-Goals

Do not build these for the current MVP unless a new approved requirement changes scope:

- Custom CRM, Lead table, `LeadStatusHistory`, `LeadNote`, `LeadAlternativeWorker`, lead assignment, lead ownership/routing, CRM dashboard, sales pipeline, follow-up scheduler, or `POST /leads` / `POST /leads/matching`.
- Persistent `MATCHING_REQUEST` or customer-request records.
- Customer accounts, customer dashboards, worker accounts, or marketplace chat.
- Booking engine, provider calendar, payments, bidding, or hourly-service marketplace behavior.
- Automated unofficial government-transfer integration.
- Redis, BullMQ, Kafka, Kubernetes, microservices, queues, or dedicated search infrastructure without measured need.

Older planning material contains hypothetical lead/reservation examples. Those examples are historical/stale relative to the simplified AHD MVP and must not be treated as current scope.

## 18. Source-of-Truth Hierarchy

Resolve uncertainty in this order:

1. Latest approved product/business decision.
2. Current canonical AHD documents in `docs/`.
3. Verified actual implementation and runtime behavior.
4. Current acceptance criteria and test evidence.
5. Historical/obsolete documents, only for context.

If canonical docs disagree with the verified implementation, investigate before coding. Do not choose a more complex interpretation automatically. Do not rewrite BRD/TRD to justify an implementation mistake, and do not rewrite working UI to satisfy an aspirational stack description.

## 19. Current Verified Implementation

| Area | State | Evidence / boundary |
|---|---|---|
| Laravel public catalogue/profile API | **VERIFIED** | MySQL-backed list/profile, publication, search/filter, and DTO checks passed. |
| Public DTO privacy | **VERIFIED** | Internal notes, IDs, private metadata, and sensitive media omitted. |
| Laravel auth/session/RBAC | **VERIFIED** | Login/session cookie, admin dashboard, unauthorized and role boundaries passed. |
| Worker CRUD/status/availability | **VERIFIED** | Create/update, skill relation, publish/unpublish/archive, availability, and audit checks passed. |
| Taxonomy/content/settings | **VERIFIED** | MySQL feature tests cover taxonomy, localized content, and public contact settings. |
| Local/public media upload | **VERIFIED locally** | Disposable image upload and storage path policy passed. |
| Binary S3-compatible upload | **EXTERNAL CHECK** | Optional S3 path exists; real credentials/upload/public retrieval require authorized hosting. |
| Specific-worker form/builders | **VERIFIED** | React browser preview and shared validation/message/URL checks passed. |
| Matching flow/builders | **VERIFIED** | Browser Step 1 → Step 2 → WhatsApp preview passed. |
| Consolidated Homepage (embedded matching, worker carousel, `/home` + `/help` redirects, simplified navbar) | **CODE VERIFIED** | Source inspection plus lint/typecheck/unit/build gates after the homepage consolidation series; the recorded browser golden slices predate this layout and should be re-run before staging sign-off. |
| Admin React integration | **VERIFIED** | Same-site localhost cookie topology loaded dashboard and worker rows. |
| Prototype visual preservation | **VERIFIED** | Existing React UI preserved; production build passes. |

## 20. Important Previous QA Fixes

These corrections are confirmed in the current code and must not regress:

- Worker create/update wrap worker fields and skill relation replacement in one transaction; invalid skill IDs do not leave partial mutations.
- Media URLs are HTTPS-only and malformed/unsafe schemes are rejected.
- Media update/delete verifies that the media belongs to the requested worker.
- Public catalogue supports nationality and availability filtering in addition to search/skill filtering.
- Public profile filters inactive nationalities.
- Specific-worker form validation is inline and preserves the profile/form UI after invalid submission.
- Admin editing retains the existing primary media and updates it rather than silently creating an unrelated duplicate.
- Icon-only admin controls have explicit accessible names.
- Direct/refresh access to `/match/thanks` without valid in-memory form state renders a truthful generic restart state; it does not persist PII or create a lead record.

## 21. Current QA Status

Latest QA result: **AHD FULL INTEGRATION PASS WITH NON-BLOCKING ITEMS**. The real Docker Compose browser path was exercised through React/Vite, Nginx, Laravel 12/PHP-FPM, MySQL 8.4, and the shared public-storage volume. Blocking contract defects in taxonomy defaults, local media presigning, multipart media metadata, relative media editing, duplicate worker-code validation, and API transport timeout/error handling were fixed and regression-tested. The approved no-CRM, WhatsApp-first MVP scope remains unchanged. The next stage is shared-hosting staging deployment; external hosting, HTTPS, and optional S3 checks remain deployment-bound.

Verified QA evidence:

- Fresh and idempotent disposable MySQL migration/reset passed; final reset left one bootstrap admin and zero synthetic workers, taxonomies, media, settings, content, sessions, audits, or pivots.
- Laravel feature suite passed with its current **9 test methods**, covering the targeted optional-sort-order, relative-presign, duplicate-code, auth, CRUD, content/settings, media ownership/limits, privacy, audit, and typed-nationality behavior against disposable MySQL.
- Golden browser admin slice passed: login → taxonomy create → worker create/update → media upload → publish → public catalogue/profile propagation.
- Public catalogue/profile/filtering and both Arabic WhatsApp preview journeys passed without sending a message or persisting customer/lead data.
- React shared unit suite (**7 tests**) passes; TypeScript typecheck and production build pass, re-run after the dependency cleanup described below.
- Docker route listing, health/readiness, same-origin Nginx routing, local public media retrieval, and app/frontend/mysql health checks passed during local integration QA.
- Repository lint passes with seven known non-fatal Fast Refresh warnings; Vite retains the existing tooltip source-map and chunk-size warnings.
- A bounded API timeout now converts a stopped-Laravel browser state into a controlled Arabic connection error instead of an indefinite skeleton.
- Existing React visual/RTL behavior was preserved; no UI redesign was introduced.

Reconciliation cleanups recorded (all CODE VERIFIED with static gates re-run):

- Root `db:migrate`/`db:status` npm aliases that invoked the superseded PostgreSQL runner were removed; canonical database commands are `docker compose exec app php artisan migrate` / `migrate:status`. The historical Express/PostgreSQL code under `scripts`, `lib/db`, and `db/migrations` remains reference-only and is no longer reachable from workspace scripts.
- The unused `@workspace/api-client-react` dependency declaration was removed from the frontend package (no source imports); the historical package itself is retained for reference.
- The Laravel scaffold `queue:listen` segment was removed from `composer.json` dev scripts; AHD has no queues or Redis (`QUEUE_CONNECTION=sync`).
- Admin editor copy now states the backend-authoritative MP4 limit of 50 MB (images 8 MB), matching `ApiController` validation.
- The public footer FAQ control navigates home and smooth-scrolls to the real `#faq` section via a deterministic pending-scroll handoff (no timing hacks); Homepage sections expose stable anchors `#matching`, `#workers`, and `#faq`.
- The Admin worker editor exposes the approved optional `age` attribute (Laravel validation: nullable integer 18–100) that was previously API-only despite being documented in PRODUCT/API as implemented domain data.

## 22. Docker-Local Development

- Full local development environment is available through `docker-compose.yml` with `web`, `frontend`, `app`, and `mysql`; `phpmyadmin` is optional under the `tools` profile.
- Primary local URL: `http://localhost:8080`; `/`, `/admin`, `/api/*`, and `/storage/*` are served through one Nginx origin.
- MySQL persists in the named `ahd_mysql_data` volume; Laravel public media persists in `ahd_laravel_storage`. `docker compose down` preserves volumes; `docker compose down -v` is the explicit disposable reset.
- Local admin bootstrap is idempotent and environment-guarded through `DatabaseSeeder`, using Docker-local `AHD_ADMIN_*` values; no local password is stored in memory or source control.
- Docker startup runs Laravel migrations and the frontend uses an image-cached Node/pnpm/Vite toolchain with editable source mounts and Vite HMR. Production remains conventional shared PHP hosting with React static assets and MySQL, not Docker.

## 23. Known External Checks

- Real shared-hosting deployment has not been exercised; PHP version/extensions, document-root isolation, writable directories, and cache/storage permissions remain host checks.
- Real production-like HTTPS/domain topology has not been exercised; secure-cookie behavior and credentialed CORS must be verified on the intended host.
- Real S3-compatible binary upload/public retrieval has not been exercised; local/public-disk upload passed on disposable MySQL.
- No real outbound WhatsApp message was sent; controlled preview URLs and Arabic messages passed for both golden journeys.
- Vite reports the existing tooltip source-map warning during production build; the build succeeds.
- The local gateway emits HTML before Laravel for requests above its configured 12 MB body limit; staging should align gateway and Laravel error handling if a JSON-only oversized-upload contract is required.
- Synthetic MySQL/admin/worker fixtures are disposable and were removed by the final clean-volume Docker reset; they must remain absent from any production classification.

## 24. Agent Working Protocol

For every substantial task:

```text
Read memory + relevant canonical docs
  → inspect current implementation
  → establish baseline
  → lock scope and decompose internally
  → make the smallest coherent change
  → run focused verification immediately
  → check visual/functional/security regressions
  → update memory only for durable knowledge
```

Use vertical slices and preserve existing UI. Do not ask the user to manually split a clearly bounded implementation task.

Preferred two-pass workflow:

1. Implementation agent investigates, implements, and self-validates.
2. Independent QA/correction agent reconstructs requirements, audits behavior, fixes defects, and reruns verification.

Retry discipline:

- First failure: read the actual error, identify its layer, and make one evidence-based fix.
- Second failure: challenge assumptions and inspect adjacent contracts/configuration.
- Before a third speculative attempt: reproduce minimally and establish root cause.

## 25. Golden Vertical Slices

Protect these business proofs:

```text
Admin Login
  → Create AHD Worker
  → Assign Nationality + Skills
  → Publish
  → Worker appears in public catalogue
  → Open profile
  → Fill request form
  → WhatsApp URL contains the trusted AHD reference
```

```text
Paid Transfer LP
  → ابدأ طلب المطابقة
  → Matching Step 1
  → Matching Step 2
  → Structured WhatsApp URL
```

MVP success means staff can manage inventory without code changes and a customer can discover/request a worker or submit household matching needs and continue through a correct WhatsApp handoff.

## 26. Future Scope Rule

Future features are not permanently forbidden. CRM, queues, Redis, dedicated search, automation, payments, and official integrations may be introduced only after a real operational need, product decision, measured data, or explicit new requirement. Treat each as a deliberate scope/architecture change with security, data-model, migration, and acceptance review.

## 27. Current Next Action

**NEXT ACTION:** Proceed to **SHARED-HOSTING STAGING DEPLOYMENT** with an authorized domain, PHP runtime, MySQL database, persistent media storage, and secret-management configuration; then run the real-domain smoke suite. Do not create new feature work for the already-passing MVP scope. The standing repository-side follow-up is to re-run the browser golden slices against the consolidated Homepage before staging sign-off.

## 28. Architecture Pivot State

The Laravel/MySQL architecture pivot was approved, implemented, tested, and browser-verified without changing the React UI or product scope. The old Express/PostgreSQL implementation is preserved as rollback/reference material and is no longer current production authority. No authorized shared-hosting target, production domain, or S3-compatible credentials are available, so no external deployment was attempted and no production data was touched. Once supplied, verify PHP/extension/document-root behavior, MySQL readiness, persistent media upload/public retrieval, HTTPS/CORS/Secure-cookie behavior, backups/restore, and the post-deploy golden slice.

## 29. Memory Maintenance Rules

- Keep this as the one canonical project-memory document: `CODEX_MEMORY.md`.
- Update only when durable product scope, architecture, data model, workflow, source-of-truth, major integration, QA discovery, or project stage changes.
- Reconcile obsolete statements in place; never append contradictory decisions.
- Do not record passwords, API keys, DB credentials, session secrets, S3 secrets, private credential-bearing URLs, customer PII, or private worker documents.
- Do not record ephemeral test IDs, one-off debugging details, or tiny CSS changes.
- After changing a durable decision, update this memory and rerun the contradiction, old-brand, CRM-scope, and secrets/PII checks.
