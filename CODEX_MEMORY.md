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

- Implementation: **completed for the verified MVP slice**.
- Independent QA/correction: **completed; result PASS WITH NON-BLOCKING ITEMS**.
- Documentation reconciliation: **current/next**.
- Production readiness: **next after documentation and deployment checks**.
- Staging: pending production-readiness work.
- Production launch: pending staging verification.

## 5. Current Architecture

Verified current runtime architecture:

```text
Vite + React public/admin app
  ├─ reads public catalogue/content/settings from API
  ├─ local form state → shared Zod validation
  └─ message builder → encoded WhatsApp URL
        │
Express 5 API
  ├─ admin session/RBAC and CRUD
  ├─ explicit public DTOs
  └─ audit/media/settings endpoints
        │
PostgreSQL (Drizzle schema + pg runtime)
        │
S3-compatible object-storage abstraction for worker media
```

The TRD contains an aspirational Next.js/NestJS/Prisma stack, but the verified implementation is Vite/React + Express + Drizzle/`pg`. Do not perform a framework/ORM rewrite solely to match that older target description. Migrate only through an explicit approved decision with visual and behavioral parity.

Architect for scale, deploy for current reality:

- PostgreSQL is the durable business source of truth.
- Keep web/API stateless where practical.
- Use connection pooling and object storage/CDN in production.
- Preserve horizontal-scaling options without adding distributed infrastructure prematurely.

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
- Assign nationality/country and skills.
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

Public catalogue data is database-backed and explicitly mapped. Public output includes approved display data such as public code, display name, nationality, city, experience, languages, skills, availability, summary, featured/order state, and public media.

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

The current Drizzle/PostgreSQL schema is in `lib/db/src/schema/index.ts`; runtime bootstrap/schema safety is in the API server. Important entities:

- `AdminUser` and `AdminSession`.
- `Worker`.
- `Nationality`.
- `Skill`.
- `WorkerSkill`.
- `WorkerMedia`.
- `ContentBlock`.
- `SystemSetting`.
- `AuditLog`.

There are no current customer, lead, booking, payment, or CRM entities. Publication and availability are represented by separate enums as listed above.

No `prisma/schema.prisma` file is present in the current repository; the Drizzle schema is the implementation source of truth until an approved migration says otherwise.

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
| Public catalogue/profile API | **VERIFIED** | Live database-backed list/profile; publication, active-nationality, search/filter behavior checked. |
| Public DTO privacy | **VERIFIED** | Actual responses omit internal notes, IDs, private metadata, and sensitive media. |
| Admin auth/session/RBAC | **VERIFIED** | Live login/session and unauthorized public mutation checks passed. |
| Worker CRUD/status/availability | **VERIFIED** | Live create/update/read, draft/publish/unpublish/archive, availability, and rollback checks passed. |
| Taxonomy CRUD | **VERIFIED** | Live nationality and skill create/update and worker relation checks passed. |
| Settings | **VERIFIED** | WhatsApp validation/configuration and invalid-value non-persistence checked. |
| Content UI/API | **IMPLEMENTED; live mutation not independently exercised in the latest matrix** | Preserve the admin content surface; add focused integration coverage before extending it. |
| Worker media URL CRUD/ownership | **VERIFIED** | HTTPS create/update/delete and cross-worker denial checked. |
| Binary S3-compatible upload | **PARTIAL** | Policy/presign boundary exists; real object-storage upload needs configured staging storage. |
| Specific-worker form/builders | **VERIFIED** | Shared validation/message/URL tests and browser inline-validation/wiring checks passed. |
| Matching LP/forms/builders | **VERIFIED** | Browser Step 1 → Step 2 and unit message/validation checks passed. |
| Outbound WhatsApp handoff | **PARTIAL** | Correct URL generation and UI wiring verified; no real external message was sent during QA. |
| Analytics privacy/event vocabulary | **VERIFIED by inspection** | Allowlist and PII-key filtering present; provider-side delivery is not configured. |
| Prototype visual preservation | **VERIFIED** | Representative routes checked at 390px, 768px, and 1440px. |

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

## 21. Current QA Status

Latest independent QA result: **PASS WITH NON-BLOCKING ITEMS**.

Verified QA evidence:

- Live isolated PostgreSQL/API authorization and CRUD matrix passed.
- Public publication lifecycle and DTO privacy passed.
- Golden admin slice passed: login → create AHD worker → assign taxonomy → publish → public catalogue.
- Public profile and matching form browser checks passed.
- Shared unit suite: 7/7 passed.
- TypeScript build/typecheck passed.
- API bundle build passed.
- Vite production build passed.
- Production dependency audit: no known vulnerabilities.
- Visual/RTL checks passed at 390px, 768px, and 1440px.

## 22. Known Non-Blocking Items

- No repository lint script is configured; the workspace `pnpm run lint` path is not a usable check and is additionally affected by the preinstall no-TTY module-purge guard.
- Automated axe/CDP E2E coverage is incomplete; the current evidence includes manual browser checks, focused unit tests, and live API integration checks.
- Real binary S3 upload has not been exercised with configured staging object storage.
- No real outbound WhatsApp message was sent during QA; external transmission requires a controlled destination and action-time approval.
- Vite reports an existing tooltip source-map warning during production build; the build still succeeds.
- Documentation reconciliation remains before production-readiness sign-off.

## 23. Agent Working Protocol

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

## 24. Golden Vertical Slices

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

## 25. Future Scope Rule

Future features are not permanently forbidden. CRM, queues, Redis, dedicated search, automation, payments, and official integrations may be introduced only after a real operational need, product decision, measured data, or explicit new requirement. Treat each as a deliberate scope/architecture change with security, data-model, migration, and acceptance review.

## 26. Current Next Action

**NEXT ACTION:** Complete canonical documentation reconciliation so all AHD source-of-truth documents describe the verified simple CRUD + catalogue + matching + WhatsApp MVP, identify the current Express/Drizzle/Vite implementation accurately, and remove or clearly quarantine stale lead/CRM planning examples. Do not reintroduce the removed architecture while doing so.

## 27. Memory Maintenance Rules

- Keep this as the one canonical project-memory document: `CODEX_MEMORY.md`.
- Update only when durable product scope, architecture, data model, workflow, source-of-truth, major integration, QA discovery, or project stage changes.
- Reconcile obsolete statements in place; never append contradictory decisions.
- Do not record passwords, API keys, DB credentials, session secrets, S3 secrets, private credential-bearing URLs, customer PII, or private worker documents.
- Do not record ephemeral test IDs, one-off debugging details, or tiny CSS changes.
- After changing a durable decision, update this memory and rerun the contradiction, old-brand, CRM-scope, and secrets/PII checks.
