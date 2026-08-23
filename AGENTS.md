# AHD Agent Operating Contract

## Read First

Use the current source-of-truth order:

```text
README.md
→ docs/PRODUCT.md
→ docs/AHD_BRD.md
→ docs/AHD_TRD.md
→ docs/ARCHITECTURE.md
→ docs/CONVENTIONS.md
→ docs/SECURITY.md
→ docs/API.md
→ docs/TESTING.md
→ docs/ACCEPTANCE_CRITERIA.md
→ docs/EXECUTION_PLAN.md
→ docs/PLANS.md
→ docs/LANDING_FUNNEL_INTEGRATION_MAP.md
→ docs/HISTORICAL_ARTIFACTS.md
→ CODEX_MEMORY.md
```

Historical files are classified in `docs/HISTORICAL_ARTIFACTS.md` and must not override current documents.

## Current MVP

```text
Admin CRUD
+ public catalogue and profiles
+ matching/transfer landing page
+ two short validated forms
+ structured WhatsApp conversion
```

Do not reintroduce CRM/lead persistence, lead pipeline, Redis/BullMQ, queues, booking, payments, accounts, marketplace chat, official government API integration, or framework migration unless a newer approved requirement explicitly changes product scope.

Operational catalogue data and WhatsApp/contact settings must be admin/data-driven, not hardcoded into product code.

## Runtime Ownership

The backend owns CRUD, publication/availability, authentication, permissions, settings, audit, and public/private DTO rules. The React/Vite frontend owns temporary request-form state, display, filters, and safe WhatsApp message generation using shared validation/builders. PostgreSQL is the business source of truth; versioned SQL migrations are applied before production traffic.

## Privacy and Security

Never send customer PII or full WhatsApp messages to analytics. Do not persist customer form PII in browser storage by default. Never expose internal notes or secrets publicly. Preserve trusted configuration boundaries for WhatsApp and media.

## Before Done

Run the relevant focused tests and then the repository gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `PORT=3001 BASE_PATH=/ pnpm build`, and `pnpm audit --audit-level=high`. For browser-affecting changes, use the repository browser/axe audit where a CDP session is available. Sync canonical documentation and durable memory when verified reality changes.
