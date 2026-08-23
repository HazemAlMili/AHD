# AHD Security and Permission Boundaries

**Version:** 4.0 — Verified MVP Security Baseline

AHD protects admin access, internal worker data, operational settings, public DTO boundaries, media ownership, and the temporary customer-to-WhatsApp handoff. Verified controls and environment-dependent items are separated below.

## Verified Controls

| Boundary | Implemented protection |
|---|---|
| Admin authentication | scrypt password verification and opaque session tokens represented by SHA-256 hashes |
| Session transport | HTTP-only cookie; production policy uses secure deployment settings and `SameSite=Lax` |
| Authorization | Server-side role enforcement on admin operations; public routes cannot mutate admin data |
| Input validation | Zod validation for admin mutations, public settings, media policy, and shared customer form readiness |
| SQL safety | Parameterized PostgreSQL queries |
| Public privacy | Explicit public DTO projections; internal notes, audit data, and admin fields remain private |
| Media | MIME/size constraints, HTTPS/public URL policy, and worker-scoped ownership checks |
| WhatsApp destination | Configuration-driven trusted destination; public input cannot override it |
| Analytics | Safe-property filtering excludes customer name, phone, email, free-text note, and full message |
| Browser storage | Customer form PII is not persisted to localStorage/sessionStorage by default |
| CORS | Explicit `AHD_ALLOWED_ORIGINS` allowlist; credentials are not combined with wildcard origin |
| Database lifecycle | Versioned transactional SQL migrations with checksums, advisory lock, status, and idempotent rerun |
| Dependencies | High-severity audit gate is part of CI and must remain at zero HIGH/CRITICAL findings |

## Customer Form Boundary

Customer forms use temporary frontend state:

```text
validate → build structured message → emit non-PII event → open WhatsApp
```

The application does not create a Lead, matching-request, CRM, or customer-account record. The selected worker reference is taken from trusted API data. The message is URL-encoded before opening the configured destination.

## Admin and Data Boundaries

The backend owns admin CRUD, publication/status, availability, permissions, settings, audit logging, and public/private DTO rules. A public caller can read approved public data but cannot create or mutate workers, taxonomy, content, settings, or media. Media update/delete requests verify that the media belongs to the requested worker.

## Environment-Dependent Verification

Real production readiness still depends on deployment configuration that cannot be proven by local code inspection:

- A real HTTPS staging domain must verify Secure-cookie behavior across the intended frontend/API topology.
- Real S3-compatible credentials, bucket policy, endpoint, public base URL, and network access must verify presigning, binary upload, and public retrieval.
- Secret values must be supplied through a deployment secret manager and must never be committed.
- `AHD_ALLOWED_ORIGINS` must be set to the real frontend origin(s), not a wildcard.

These are deployment gates, not reasons to add CRM, persistence, queues, or a new framework.

## Operational Rules

Run database migrations before production traffic. Keep public content and contact settings admin/data-driven. Do not publish unverified licenses, guarantees, government affiliation, pricing, response promises, or private worker information. Any future CRM, official integration, automated outbound messaging, or customer-account feature requires a separate threat model and security review.
