# AHD API Contract Baseline

**Version:** 3.0 — Simplified CRUD MVP

## Public
```http
GET /api/v1/workers
GET /api/v1/workers/:slug
GET /api/v1/nationalities
GET /api/v1/skills
GET /api/v1/content/:key
GET /api/v1/public-settings
```

`public-settings` may expose approved WhatsApp/phone contact data.

## Admin
```http
POST /api/v1/admin/auth/login
POST /api/v1/admin/auth/logout
GET  /api/v1/admin/auth/session

GET/POST/PATCH /api/v1/admin/workers
POST /api/v1/admin/workers/:id/publish
POST /api/v1/admin/workers/:id/unpublish
POST /api/v1/admin/workers/:id/archive
PATCH /api/v1/admin/workers/:id/availability

GET/POST/PATCH /api/v1/admin/nationalities
GET/POST/PATCH /api/v1/admin/skills
GET/PATCH /api/v1/admin/content/:key
GET/PATCH /api/v1/admin/settings/:key
```

## WhatsApp Forms
No backend `POST /leads` is required in MVP.

Frontend validates, builds a URL-encoded message, tracks a non-PII event, then opens the configured WhatsApp number.

Generate OpenAPI from NestJS implementation.
