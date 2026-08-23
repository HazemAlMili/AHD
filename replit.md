# Historical Scaffold Notice

This file is a **HISTORICAL / NON-CANONICAL** Replit-derived scaffold note. It is retained for provenance and must not be used as the current setup, architecture, database, or API guide.

For current AHD / عهد identity, product scope, repository layout, environment, migrations, development commands, API endpoints, and quality gates, start with [`README.md`](README.md). For the preserved-artifact classification, see [`docs/HISTORICAL_ARTIFACTS.md`](docs/HISTORICAL_ARTIFACTS.md).

The current runtime is React 19 + Vite + wouter + Tailwind in `artifacts/khadematy-site`, Express 5 in `artifacts/api-server`, PostgreSQL with parameterized `pg` queries, Zod validation, Drizzle declarations where applicable, and explicit SQL migrations under `db/migrations`. Do not follow the old scaffold's code-generation, schema-push, Node-version, or package-layout assumptions.
