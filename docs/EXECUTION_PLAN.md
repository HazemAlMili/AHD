# AHD — Systematic Execution Plan

**Version:** 2.0 — Simplified CRUD + WhatsApp MVP

## Phase 0 — Scope Freeze
Confirm:
`Admin CRUD + Catalogue + Paid Matching LP + WhatsApp`.
No CRM/payments/bookings/accounts.

## Phase 1 — Foundation
- monorepo
- web/admin/api
- PostgreSQL/Prisma
- admin auth
- object storage abstraction
- CI/design primitives

Gate: builds, migrations, auth, CI.

## Phase 2 — Admin CRUD
- Nationalities/Countries
- Skills
- Workers
- Media
- Draft/Publish/Archive
- WhatsApp/contact settings

Gate:
```text
Admin creates worker → publishes → public API returns worker
```

## Phase 3 — Public Catalogue
- homepage
- worker listing
- filters/search
- worker profile
- SEO/RTL/mobile/accessibility

Gate: customer can find/evaluate worker easily.

## Phase 4 — Specific Worker WhatsApp
- request CTA
- small form
- validation
- message builder
- WhatsApp URL
- analytics

Gate:
```text
Profile → form → WhatsApp contains correct worker code
```

## Phase 5 — Paid Matching LP
- conversion LP
- Need-Based Matching
- two-step form
- matching message builder
- sticky CTA
- WhatsApp

Gate:
```text
LP → Step 1 → Step 2 → correct WhatsApp message
```

## Phase 6 — Quality
- analytics
- no PII
- WCAG 2.2 AA
- performance
- Sentry
- security hardening

## Phase 7 — Production/Scale
- deploy
- DB pooling
- CDN/object storage
- backups/restore
- monitoring/load test
- multi-instance readiness

Add Redis/queues/CRM only when measured/business need appears.

## Golden Vertical Slice
```text
Admin creates AHD-1024
→ publishes
→ customer opens profile
→ request form
→ WhatsApp opens with AHD-1024
```
