# AHD API Contract

The current API is Laravel 12 under `/api`. JSON success responses use `{ "data": ... }`; errors use `{ "message": "..." }` and appropriate HTTP status codes. The existing React adapter remains unchanged by using the same `/api/v1` route shapes and field names.

## Health and Readiness

| Method | Path | Auth | Result |
|---|---|---|---|
| GET | `/api/healthz` | None | Dependency-light liveness `{status:"ok"}`. |
| GET | `/api/readyz` | None | Database readiness; `503` when MySQL is unavailable. |

## Public Read API

| Method | Path | Query/path | Result |
|---|---|---|---|
| GET | `/api/v1/workers` | `q`, `skill`, `nationality`, `availability` | Published, active-nationality public worker DTOs. |
| GET | `/api/v1/workers/{slug}` | Slug or public code | One published public worker DTO or `404`. |
| GET | `/api/v1/nationalities` | None | Active taxonomies in camelCase public shape. |
| GET | `/api/v1/skills` | None | Active skills in camelCase public shape. |
| GET | `/api/v1/content/{key}` | Content key | Active localized content or `404`. |
| GET | `/api/v1/public-settings` | None | Trusted `whatsappNumber` and `phoneNumber` values when configured. |

Public routes are read-only. A public worker DTO contains the approved public code, display name, slug, nationality, age, city, experience, public summary, languages, skill labels, availability, featured state, and public media. It does not contain internal notes, audit fields, admin IDs, private media, or database-only metadata.

## Admin Authentication

| Method | Path | Behavior |
|---|---|---|
| POST | `/api/v1/admin/auth/login` | Validates email/password, creates an expiring opaque session token, stores only its SHA-256 hash, and sets an HTTP-only cookie. |
| POST | `/api/v1/admin/auth/logout` | Deletes the current session record and forgets the cookie. |
| GET | `/api/v1/admin/auth/session` | Returns the authenticated admin DTO or `401`. |

The production cookie must be secure over HTTPS and use an appropriate SameSite policy. Tokens are not returned in JSON or stored in localStorage.

## Admin Operations

All paths below require the session cookie. Role middleware enforces the approved role capabilities; missing/expired sessions return `401`, insufficient roles return `403`, invalid input returns `422`, missing resources return `404`, and database constraint failures must not leave partial transactional worker writes.

| Method | Path | Operation |
|---|---|---|
| GET | `/api/v1/admin/workers` | List full operational worker records. |
| POST | `/api/v1/admin/workers` | Create a worker and atomically assign skill IDs. |
| PATCH | `/api/v1/admin/workers/{id}` | Update worker fields and optionally replace skills atomically. |
| POST | `/api/v1/admin/workers/{id}/publish` | Publish a worker. |
| POST | `/api/v1/admin/workers/{id}/unpublish` | Return a worker to draft. |
| POST | `/api/v1/admin/workers/{id}/archive` | Archive a worker. |
| PATCH | `/api/v1/admin/workers/{id}/availability` | Set an approved availability state. |
| GET/POST/PATCH | `/api/v1/admin/nationalities[/{id}]` | Read/create/update taxonomies. |
| GET/POST/PATCH | `/api/v1/admin/skills[/{id}]` | Read/create/update skills. |
| GET/PATCH | `/api/v1/admin/content/{key}` | Read/update localized content. |
| GET/PATCH | `/api/v1/admin/settings/{key}` | Read/update trusted settings such as WhatsApp/phone. |
| POST | `/api/v1/admin/workers/{id}/media/upload` | Upload through local/public disk or return S3-compatible upload metadata when configured. |
| POST/PATCH/DELETE | `/api/v1/admin/workers/{id}/media[/{mediaId}]` | Save, update, or delete owned media metadata. |

## Worker Input Shape

Worker mutations accept the existing frontend field contract: `publicCode`, `displayName`, `slug`, `nationalityName`, `nationalityId`, `age`, `currentCity`, `yearsExperience`, `saudiExperienceYears`, `publicSummaryEn`, `publicSummaryAr`, `languages`, `internalNotes`, `availabilityStatus`, `publicationStatus`, `isFeatured`, `sortOrder`, and `skillIds`. The admin UI uses `nationalityName` as free text; Laravel creates or reuses the matching nationality taxonomy record and stores its ID. `nationalityId` remains supported for compatibility and direct API clients. The Laravel boundary also accepts the persisted snake_case names used by the admin table.

## Media Rules

Approved types are JPEG, PNG, WebP, and MP4 with configured size limits. Media must belong to the referenced worker. Production public media URLs must use HTTPS; local development may use controlled `/storage/...` paths. Unsafe types, oversized files, invalid URLs, cross-worker media IDs, and unconfigured storage are rejected.

## Explicit Non-Routes

There is no `POST /leads`, `POST /leads/matching`, customer account endpoint, booking endpoint, payment endpoint, CRM endpoint, queue endpoint, or persisted matching-request endpoint. WhatsApp requests are assembled in the frontend and are not submitted to Laravel as customer records.
