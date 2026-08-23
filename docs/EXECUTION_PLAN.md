# AHD Execution Plan

**Version:** 4.0 — Final Closure Roadmap

## Product Scope

AHD is a WhatsApp-first domestic-worker discovery and need-based matching MVP:

```text
Admin CRUD → public catalogue / transfer landing page → validated form → WhatsApp → sales/operations
```

The current plan does not include CRM, lead persistence, payments, bookings, accounts, Redis, BullMQ, queues, or a framework rewrite.

## Delivery History

| Stage | Status | Result |
|---|---|---|
| Product definition | Complete | WhatsApp-first business scope and guardrails established |
| Replit-derived visual prototype | Complete | Preserved as historical visual context; not runtime authority |
| React/Vite productionization | Complete | Maintained app lives under the legacy `artifacts/khadematy-site` path |
| Express API and PostgreSQL | Complete | Public/admin boundaries, parameterized `pg`, and migrations implemented |
| Admin CRUD | Complete | Workers, taxonomy, content/settings, publication, availability, media, and auth |
| Public catalogue | Complete | DB-backed catalogue, filters, profiles, DTO privacy |
| Specific-worker WhatsApp flow | Complete | Validated form, trusted reference, encoded URL |
| Need-based matching flow | Complete | Two-step validated form, consent, encoded URL |
| Independent QA and hardening | Complete | Authorization, privacy, media, migration, readiness, lint/CI corrections |
| Disposable PostgreSQL staging | Complete | Migration, admin, public, lifecycle, CORS, browser/axe verification |
| Final source-of-truth reconciliation | In progress | Canonical documentation and durable memory are being closed in Task 3 |

## Current Closure Stage

Task 3 is the final source-of-truth and production-readiness closure. It must reconcile all canonical documentation with verified implementation, preserve the existing UI and scope, update durable memory, rerun all quality gates, and push one coherent documentation commit.

Repository-controlled behavior is classified as ready when the final gates pass. Real S3 binary upload/public retrieval and a production-like HTTPS/domain topology remain external gates unless valid configuration becomes available for verification.

## Final Closure Sequence

```text
reconcile docs
→ classify historical artifacts
→ update CODEX_MEMORY
→ run install/lint/typecheck/test/build/audit/diff checks
→ inspect stale-brand/scope/secrets results
→ commit and push
→ resolve only named external infrastructure blockers
→ production deployment
```

## Deployment Prerequisites

Before production traffic, configure a PostgreSQL database, run `pnpm db:status` and `pnpm db:migrate`, configure admin bootstrap/session secrets, set an explicit CORS allowlist, configure public contact/WhatsApp settings, and configure S3-compatible storage if binary uploads are required. A deployed HTTPS topology must be used to verify Secure-cookie and credentialed CORS behavior.

## Next Stage

If repository-controlled checks pass but S3 and/or HTTPS remain unavailable, the next stage is **resolve the named external infrastructure blocker(s), then Production Deployment**. If both external checks pass as well, the next stage is **Production Deployment**.

External observability is not a current product requirement. Add it only when a separately approved operational need exists; current analytics and server/application logs must continue to exclude customer PII.
