# AGENTS.md

## Read First
`PRODUCT.md → AHD_BRD.md → AHD_TRD.md → ARCHITECTURE.md → CONVENTIONS.md → SECURITY.md → API.md → TESTING.md → ACCEPTANCE_CRITERIA.md → EXECUTION_PLAN.md → PLANS.md`

## Current MVP
```text
Admin CRUD
+ public catalogue
+ paid matching LP
+ simple forms
+ WhatsApp conversion
```

Do not reintroduce a custom CRM/lead pipeline, Redis/BullMQ, booking, payments, or marketplace architecture unless a newer approved requirement explicitly asks for it.

Operational catalogue data and WhatsApp/contact settings must be admin/data-driven, not hardcoded.

Backend owns CRUD, publication/status, permissions, and public/private DTO rules.

Frontend owns temporary request-form state and safe WhatsApp message generation.

Never send PII to analytics or persist form PII in browser storage by default.

Keep the architecture simple but stateless/scale-ready.

Before Done: lint, typecheck, relevant tests, accessibility/performance/analytics checks where applicable, and docs sync.
