# AHD API Contract

**Version:** 4.0 — Verified Express API

The current API is an Express 5 application. This document describes the registered route surface in the maintained server under `artifacts/api-server`; it is not generated from NestJS/OpenAPI codegen. Customer request forms remain frontend → WhatsApp flows and do not create backend lead records.

## Base Paths and Service Endpoints

The API routes are mounted under `/api`.

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/healthz` | Dependency-light liveness | Public |
| `GET` | `/api/readyz` | Database/migration readiness | Public |

Readiness returns success only when the configured database is reachable and the migration lifecycle is in an acceptable state. Liveness does not prove database readiness.

## Public Read API

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/workers` | Published, public worker catalogue with approved filtering/search |
| `GET` | `/api/v1/workers/:slug` | One published public worker profile |
| `GET` | `/api/v1/nationalities` | Active public nationality options |
| `GET` | `/api/v1/skills` | Active public skill options |
| `GET` | `/api/v1/content/:key` | Active public content block |
| `GET` | `/api/v1/public-settings` | Approved public contact settings such as WhatsApp/phone |

Public responses use explicit DTO projections. Internal IDs, private notes, audit data, admin credentials, and other non-public fields are not serialized into the public contract.

## Admin Authentication

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/admin/auth/login` | Verify configured admin credentials and issue an HTTP-only session cookie |
| `POST` | `/api/v1/admin/auth/logout` | Revoke the current session |
| `GET` | `/api/v1/admin/auth/session` | Return the current authenticated admin or an unauthorized response |

Sessions use an opaque token whose SHA-256 hash is stored server-side. Password verification uses scrypt. Admin requests must carry the session cookie and satisfy the required role.

## Admin Worker and Media Routes

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/workers` | List operational workers |
| `POST` | `/api/v1/admin/workers` | Create a worker draft |
| `PATCH` | `/api/v1/admin/workers/:id` | Update a worker |
| `POST` | `/api/v1/admin/workers/:id/publish` | Publish a worker |
| `POST` | `/api/v1/admin/workers/:id/unpublish` | Return a worker to unpublished state |
| `POST` | `/api/v1/admin/workers/:id/archive` | Archive a worker |
| `PATCH` | `/api/v1/admin/workers/:id/availability` | Change availability |
| `POST` | `/api/v1/admin/workers/:id/media/upload` | Prepare an S3-compatible presigned upload |
| `POST` | `/api/v1/admin/workers/:id/media` | Save approved URL media metadata |
| `PATCH` | `/api/v1/admin/workers/:id/media/:mediaId` | Update owned media metadata |
| `DELETE` | `/api/v1/admin/workers/:id/media/:mediaId` | Delete owned media metadata |

Media upload preparation is constrained by approved MIME type and size policy. URL media must satisfy the HTTPS/public policy. Media operations verify that the media belongs to the requested worker.

## Admin Taxonomy, Content, and Settings Routes

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/admin/nationalities` | List nationalities |
| `POST` | `/api/v1/admin/nationalities` | Create nationality |
| `PATCH` | `/api/v1/admin/nationalities/:id` | Update nationality |
| `GET` | `/api/v1/admin/skills` | List skills |
| `POST` | `/api/v1/admin/skills` | Create skill |
| `PATCH` | `/api/v1/admin/skills/:id` | Update skill |
| `GET` | `/api/v1/admin/content/:key` | Read an admin content block |
| `PATCH` | `/api/v1/admin/content/:key` | Upsert an admin content block |
| `GET` | `/api/v1/admin/settings/:key` | Read a setting |
| `PATCH` | `/api/v1/admin/settings/:key` | Upsert an approved setting |

Route-level role checks protect operational mutations. Important changes are written to the audit log where implemented.

## Customer Request Contract

There is intentionally no current `POST /leads`, `POST /leads/matching`, or `POST /requests` endpoint. Specific-worker and matching forms use temporary frontend state:

```text
frontend validation → pure message builder → non-PII analytics event → encoded configured WhatsApp URL
```

The specific-worker message uses the trusted public worker reference returned by the API. The matching message uses the approved two-step answers. Public input cannot override the configured WhatsApp destination.

## Errors and CORS

Malformed or rejected input is returned as a structured client error, normally HTTP 400. Missing resources return HTTP 404. Missing/invalid authentication returns HTTP 401; insufficient role returns HTTP 403. Oversized media returns HTTP 413. Missing external storage configuration returns an explicit service/configuration error rather than a false success. CORS uses `AHD_ALLOWED_ORIGINS` as an explicit allowlist and supports credentials only for allowed origins; wildcard origin is not used with credentials.
