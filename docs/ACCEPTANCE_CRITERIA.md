# AHD Acceptance Criteria

**Version:** 4.0 — Final MVP Closure Criteria

The criteria below describe the current product behavior. The repository-controlled criteria were verified in the disposable staging run; real object storage and deployed HTTPS remain environment-dependent gates.

## Admin

- [x] Authorized admin can log in and maintain a session.
- [x] Worker CRUD, nationality CRUD, and skill CRUD work through the protected API.
- [x] Admin can publish, unpublish, archive, change availability, feature/order, and manage approved media.
- [x] Admin can configure WhatsApp/public contact settings and public content.
- [x] Public output updates from admin-managed data without source-code changes.

## Public Catalogue

- [x] Published, requestable workers appear in the public catalogue.
- [x] Draft, unpublished, archived, and non-requestable records do not appear as active inventory.
- [x] Public API uses explicit DTOs and does not expose internal notes/private fields.
- [x] Search, nationality/skill/availability filters, and profiles work on representative mobile/tablet/desktop layouts.

## Specific-Worker WhatsApp

- [x] `اطلب هذه العاملة` opens a short form.
- [x] Invalid input is blocked with understandable inline feedback.
- [x] Trusted worker public code is included automatically.
- [x] The correct URL-encoded Arabic WhatsApp message is generated.
- [x] Destination comes from approved configuration and cannot be overridden by public input.
- [x] No Lead record is required or created.

## Need-Based Matching

- [x] Matching landing page has the approved primary CTA `ابدأ طلب المطابقة`.
- [x] Two-step form works with the approved fields.
- [x] Email and budget are not required.
- [x] Consent and required fields block incomplete submission.
- [x] Valid answers generate a structured URL-encoded WhatsApp message.
- [x] Catalogue browsing is not required.
- [x] Direct/refresh access to the thank-you route shows a truthful generic restart state when no in-memory form exists.

## Analytics and Privacy

- [x] Approved view, form-step, and WhatsApp-click events are emitted.
- [x] Analytics properties exclude name, phone, email, free-text note, full message, and private worker data.
- [x] Customer form PII is not persisted in browser storage by default.

## Quality and Operations

- [x] Server-side admin authorization and public mutation denial are enforced.
- [x] Versioned migrations support status, fresh apply, idempotent rerun, checksums, advisory locking, and compatible-schema adoption.
- [x] Liveness and database readiness endpoints are available.
- [x] WCAG 2.2 AA browser audit has no reported violations on the audited routes.
- [x] Lint, typecheck, unit tests, build, CI, and high-severity dependency audit pass.
- [ ] Real S3 binary upload/public retrieval is verified with staging object storage credentials.
- [ ] Production Secure-cookie topology is verified on a deployed HTTPS staging domain.

## Final MVP Loop

```text
Admin creates worker
→ publishes worker
→ customer discovers worker or starts matching
→ form validates
→ correct WhatsApp message opens
```
