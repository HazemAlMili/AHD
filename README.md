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

## Current Runtime Stack

- Vite + React 19 + TypeScript + wouter
- Tailwind CSS and Lucide UI primitives
- Express 5 API
- PostgreSQL with parameterized `pg` SQL and shared Drizzle declarations
- Zod validation and shared WhatsApp message builders
- Scrypt password verification with opaque HTTP-only cookie sessions
- S3-compatible presigned media uploads
- Vitest-style Node tests and a repository browser-audit utility

Redis, BullMQ, CRM, and lead persistence are not part of the current MVP.

## Local Setup and Verification

Copy `.env.example` to `.env` and provide local values. Install the locked dependency graph with `pnpm install --frozen-lockfile`. Apply the version-controlled database lifecycle with `pnpm db:migrate`; inspect migration state with `pnpm db:status`. Production traffic must not rely on request-time schema creation.

Run repository checks with `pnpm lint`, `pnpm typecheck`, and `pnpm test`. Build with `PORT=3001 BASE_PATH=/ pnpm build`. The API liveness endpoint is `/api/healthz`; the database readiness endpoint is `/api/readyz`.

Operational worker, taxonomy, content, and public contact data must be admin-driven.

> **Architect for scale, deploy for current reality.**
