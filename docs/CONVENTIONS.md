# AHD Engineering Conventions

Use strict TypeScript.

Preferred domain terms:
`Worker, Nationality, Skill, PublicationStatus, WorkerAvailabilityStatus, PublicSettings, WhatsAppMessageBuilder`.

Do not use CRM `Lead` terminology in MVP unless a future approved scope introduces it.

Use explicit public DTOs; never serialize full DB records publicly.

Keep WhatsApp formatting in pure reusable functions:
`buildWorkerRequestMessage`, `buildMatchingRequestMessage`, `buildWhatsAppUrl`.

Never send PII to analytics.

Use Prisma migrations, real FK relations, and archive/status instead of destructive deletion where history matters.

Public frontend: Server Components by default, local component state for short forms, minimal client JS.

Admin: operational forms/tables with server-side permissions.

Target WCAG 2.2 AA.
