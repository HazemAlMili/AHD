# AHD (عهد)

AHD is a Saudi domestic-worker discovery and sponsorship/service-transfer request website. It gives operations staff a controlled catalogue, lets customers browse published worker profiles or describe a household need, and hands the validated request to the configured business WhatsApp conversation. Sales and operations continue outside the website.

> **MVP loop:** Admin manages inventory → public catalogue or matching landing page → short validated form → structured WhatsApp handoff → sales/operations.

The MVP deliberately does **not** include a CRM, lead table, customer or worker accounts, booking, payments, marketplace chat, Redis, BullMQ, queue processing, or official government-transfer integration. These are future-scope decisions, not missing setup steps.

## Current Runtime Stack

| Layer | Verified implementation |
|---|---|
| Public/admin frontend | React 19, TypeScript, Vite, wouter, Tailwind CSS, Lucide primitives |
| API | Express 5 with a single public/admin HTTP surface |
| Validation | Zod schemas shared with the frontend/domain utilities |
| Database | PostgreSQL accessed through parameterized `pg` repository queries |
| Database declarations | Drizzle schema/type declarations in `lib/db`; they do not replace the SQL migration lifecycle |
| Authentication | scrypt password verification, opaque session token, SHA-256 token hash, HTTP-only cookie |
| Media | S3-compatible presigned uploads with HTTPS/public-URL and ownership checks |
| Quality | ESLint, TypeScript, Node unit tests, production builds, dependency audit, GitHub Actions, browser/axe audit |

The technical path `artifacts/khadematy-site` is retained for repository compatibility. It is the maintained AHD public/admin frontend; the path name is historical and does **not** represent the current product branding.

## Repository Layout

| Path | Responsibility |
|---|---|
| `artifacts/khadematy-site` | Maintained React/Vite public website and admin interface |
| `artifacts/api-server` | Maintained Express API, authentication, routes, repositories, health/readiness |
| `lib/db` | PostgreSQL connection and Drizzle schema/type declarations |
| `lib/api-zod` | Shared validation and WhatsApp message-building domain helpers |
| `scripts` | Migration runner, unit/authorization tests, browser audit |
| `db/migrations` | Versioned SQL migrations; apply before production traffic |
| `docs` | Canonical product, architecture, API, security, testing, acceptance, and planning documents |
| `.github/workflows/ci.yml` | Repository verification pipeline |
| `artifacts/mockup-sandbox` | Historical visual/prototype artifact; not the production application |
| `docs/prisma/schema.prisma` | Historical/superseded schema reference; not the live database authority |
| `khadematy-local.zip` | Historical local artifact archive; do not treat as current source |

## Canonical Documentation Read Order

Read the maintained source of truth in this order:

1. `docs/PRODUCT.md` — product identity, MVP loop, and scope guardrails.
2. `docs/AHD_BRD.md` — business requirements only.
3. `docs/AHD_TRD.md` — current technical requirements and verified runtime.
4. `docs/ARCHITECTURE.md` — conceptual boundaries and data flow.
5. `AGENTS.md` — agent operating rules.
6. `docs/CONVENTIONS.md` — implementation conventions.
7. `docs/SECURITY.md` — verified protections and environment-dependent limits.
8. `docs/API.md` — registered public/admin route contract.
9. `docs/TESTING.md` — verification layers and staging evidence.
10. `docs/ACCEPTANCE_CRITERIA.md` — behavioral acceptance gates.
11. `docs/EXECUTION_PLAN.md` — delivery sequence.
12. `docs/PLANS.md` — planning and change-control protocol.
13. `docs/LANDING_FUNNEL_INTEGRATION_MAP.md` — funnel and attribution map.
14. `docs/HISTORICAL_ARTIFACTS.md` — preserved files and legacy-path classification.
15. `CODEX_MEMORY.md` — durable verified project state and next action.

Historical files are explicitly classified in `docs/HISTORICAL_ARTIFACTS.md` and must not override the documents above.

## Environment Setup

Use Node 22 and pnpm 11.21.0, matching CI. Copy `.env.example` to `.env` and provide environment-specific values through a secret manager outside local development. Never commit credentials.

```bash
pnpm install --frozen-lockfile
cp .env.example .env
```

`DATABASE_URL` and `PORT` are required by the API. `AHD_ALLOWED_ORIGINS` must be an explicit comma-separated allowlist in production; do not use `*` with credentialed requests. Configure `AHD_ADMIN_EMAIL` and `AHD_ADMIN_PASSWORD` only through a protected deployment secret or local development environment. Configure `AHD_S3_*` for real object storage and use HTTPS for public media. Public WhatsApp and phone values are admin/data-driven through system settings; `VITE_WHATSAPP_NUMBER` and `VITE_PHONE_NUMBER` are local fallbacks only.

## Database Lifecycle

The production database lifecycle is explicit and versioned. Apply migrations before starting production traffic; request-time schema creation is not the production contract.

```bash
pnpm db:status
pnpm db:migrate
```

The migration runner uses transactional SQL, checksums, advisory locking, idempotent reruns, and safe adoption of a compatible existing schema. A normal deployment must run `pnpm db:status` and `pnpm db:migrate` against the intended target before serving application traffic.

## Development and Verification

Run the API and frontend in separate terminals for local development:

```bash
pnpm --filter @workspace/api-server dev
pnpm --filter @workspace/ahd-site dev
```

The API requires a valid `PORT`; the frontend uses `VITE_API_URL` for its API base URL. Run the repository gates with the same commands used by CI:

```bash
pnpm lint
pnpm typecheck
pnpm test
PORT=3001 BASE_PATH=/ pnpm build
pnpm audit --audit-level=high
```

The live API exposes dependency-free liveness at `GET /api/healthz` and database/migration readiness at `GET /api/readyz`. A successful build may still print the known non-fatal Vite tooltip source-map warning; it does not change the build exit status.

## MVP Architecture Summary

The public React/Vite application reads approved catalogue/content/settings data from the Express public API. The admin React interface uses the protected Express admin API for worker, taxonomy, content, settings, media, publication, and availability operations. PostgreSQL is the business source of truth. Worker media uses S3-compatible object storage when configured. Customer forms remain temporary frontend state: Zod validation → pure message builder → non-PII analytics event → encoded WhatsApp URL. No customer request is persisted by the website.

## CI

GitHub Actions runs on pushes to `main` and pull requests. It installs with `pnpm install --frozen-lockfile`, then runs lint, typecheck, unit tests, build with `PORT=3001` and `BASE_PATH=/`, and `pnpm audit --audit-level=high`. Deployment-specific staging checks remain an environment operation, not a substitute for the repository gates.

> **Architect for scale, deploy for current reality.**
