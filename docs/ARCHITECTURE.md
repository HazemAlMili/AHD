# AHD Architecture

**Version:** 3.0 — Final Verified Architecture

## System Boundary

```text
Public React/Vite App
  ├─ reads approved catalogue/content/settings
  ├─ filters and renders public DTOs
  └─ validates short form → builds WhatsApp URL
          │
          ▼
Express 5 API
  ├─ public read routes
  ├─ protected admin routes
  ├─ health/readiness
  └─ auth, validation, repositories, audit
          │
          ▼
PostgreSQL

Admin React/Vite Interface
  └─ authenticated CRUD, publication, availability, settings/content

Worker Media → S3-Compatible Object Storage

WhatsApp → external operational conversation
```

## Runtime Responsibilities

The public React/Vite application owns presentation, filters, temporary request-form state, shared Zod readiness checks, and safe WhatsApp URL construction. The admin UI owns operational controls but never bypasses server-side permission checks. The Express API owns authentication, authorization, CRUD, publication and availability rules, public DTO projection, settings, audit logging, health, and readiness. PostgreSQL is the business source of truth. S3-compatible storage is used for approved worker media when configured.

## Database Lifecycle

Versioned SQL migrations in `db/migrations` are applied before production traffic with `pnpm db:migrate` and inspected with `pnpm db:status`. The migration runner is transactional, checksum-protected, advisory-lock-protected, idempotent, and able to adopt a compatible existing schema. Request-time schema creation is not the production deployment contract.

## Trust Boundaries

Public routes expose only explicit approved DTOs. Admin routes require an HTTP-only session and role authorization. Public customer forms do not write a lead or matching-request record. They validate locally, emit non-PII behavioral events, and open a configured WhatsApp destination. Worker media operations verify worker ownership and enforce type/size/HTTPS policy.

## Scale and Non-Goals

The web/API tier is stateless and can be deployed behind a suitable reverse proxy or load balancer. PostgreSQL filtering, indexes, connection-aware deployment, and object storage/CDN are the current scaling path. Redis, BullMQ, queues, CRM, dedicated search, microservices, Kafka, Kubernetes, and framework migration are not mandatory architecture components for this MVP.
