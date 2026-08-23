# AHD Historical Artifacts and Non-Canonical Files

**Purpose:** prevent preserved prototype and legacy files from overriding the current AHD source of truth.

The current source of truth is `README.md`, the canonical documents under `docs/`, the maintained implementation under `artifacts/khadematy-site` and `artifacts/api-server`, the versioned SQL under `db/migrations`, and the durable summary in `CODEX_MEMORY.md`. The files below are retained for provenance or technical compatibility only.

| Artifact | Classification | Rule |
|---|---|---|
| `docs/prisma/schema.prisma` | HISTORICAL / SUPERSEDED | Former schema snapshot; not the runtime migration authority and not a current field contract |
| `replit.md` | HISTORICAL / NON-CANONICAL | Former generic scaffold note; do not use its commands, framework claims, or dependency assumptions |
| `artifacts/mockup-sandbox` | HISTORICAL PROTOTYPE | Replit-derived visual/prototype artifact; not the production API-backed application |
| `khadematy-local.zip` | HISTORICAL ARCHIVE | Preserved archive; not a maintained source tree and not current product branding |
| `artifacts/khadematy-site` | MAINTAINED IMPLEMENTATION WITH LEGACY PATH | Current React/Vite public/admin application despite the historical path segment; do not rename for cosmetics |
| `artifacts/api-server` | MAINTAINED IMPLEMENTATION | Current Express 5 API and server runtime source |

## Superseded Architecture Language

Older documents may mention Next.js, NestJS, Prisma, server components, OpenAPI code generation, or schema push workflows. Those terms are historical context only. The verified runtime is React 19 + Vite + wouter + Tailwind, Express 5, PostgreSQL with parameterized `pg` queries, Drizzle declarations where applicable, Zod, and explicit SQL migrations.

## Historical Branding

`Khadematy`, `khadematy`, `خادمتي`, `KH-`, and legacy path names must not be used as active AHD customer-facing identity. Current product identity is **AHD / عهد**. A legacy path may remain in code when renaming would create technical risk; documentation must label it as historical or legacy.

## Retention Rule

Do not delete historical artifacts merely to make scans look clean. Classify them clearly, keep active documentation unambiguous, and inspect the maintained implementation before making any change.
