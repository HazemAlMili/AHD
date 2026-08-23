# AHD (عهد)

AHD is a domestic-worker discovery and sponsorship/service-transfer request website for the Saudi market.

Current MVP:

```text
Admin CRUD
→ Public Catalogue / Paid Matching Landing Page
→ Simple Form
→ WhatsApp
```

No custom CRM is required for the MVP.

## Documentation Read Order

1. `PRODUCT.md`
2. `AHD_BRD.md`
3. `AHD_TRD.md`
4. `ARCHITECTURE.md`
5. `AGENTS.md`
6. `CONVENTIONS.md`
7. `SECURITY.md`
8. `API.md`
9. `TESTING.md`
10. `ACCEPTANCE_CRITERIA.md`
11. `EXECUTION_PLAN.md`
12. `PLANS.md`
13. `LANDING_FUNNEL_INTEGRATION_MAP.md`

## Core Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- NestJS
- PostgreSQL
- Prisma
- S3-compatible object storage
- Playwright + axe-core
- Sentry
- Product analytics

Redis and BullMQ are deferred until a measured requirement appears.

Operational worker, taxonomy, content, and public contact data must be admin-driven.

> **Architect for scale, deploy for current reality.**
