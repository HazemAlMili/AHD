# AHD Product Definition

**Version:** 3.0 — Simplified WhatsApp Conversion MVP

## Product
AHD is a Saudi domestic-worker discovery and sponsorship/service-transfer request website.

MVP loop:

```text
Admin manages workers
→ worker data appears publicly
→ customer selects a worker OR describes a need
→ small form validates
→ WhatsApp opens with a structured prefilled message
→ sales/operations continue on WhatsApp
```

No custom CRM, customer account, booking engine, or payment flow is required in MVP.

## Core Capabilities
1. Admin CRUD for workers.
2. Admin CRUD for nationalities/countries and skills.
3. Public worker catalogue and profiles.
4. Paid Need-Based Matching landing page.
5. Simple forms that generate WhatsApp messages.
6. Basic non-PII analytics.
7. Admin-managed public WhatsApp/contact settings.

## Worker
Recommended fields:
- id
- public reference/code
- name/display name
- nationality/country
- age if approved
- city if useful
- experience
- Saudi experience
- skills
- languages
- expected salary if approved
- transfer amount if approved
- public description
- image/gallery
- availability
- publication status
- featured/order
- internal notes

Availability:
`AVAILABLE | ON_HOLD | RESERVED | TRANSFER_IN_PROGRESS | TRANSFERRED | UNAVAILABLE`

Publication:
`DRAFT | PUBLISHED | ARCHIVED`

## Main Website
```text
Homepage
→ Workers
→ Worker Profile
→ اطلب هذه العاملة
→ Small Form
→ WhatsApp
```

The form may ask for name, city, mobile if useful, and optional note. The worker public reference must be inserted automatically.

## Paid Funnel
```text
Google Search
→ Transfer Landing Page
→ ابدأ طلب المطابقة
→ Step 1: household need
→ Step 2: contact/readiness
→ WhatsApp
```

The paid funnel is matching-first, not catalogue-first.

## Matching Form
Step 1:
- city
- urgency
- household needs
- language preference optional
- Saudi-experience preference optional

Step 2:
- name
- mobile if required by business
- nationality preference optional/approved only
- readiness
- privacy/consent acknowledgement

No email or budget field in V1.

## WhatsApp
The website composes a structured message and opens the configured business WhatsApp number.

Specific-worker example:

```text
السلام عليكم،
أنا مهتم/ة بالعاملة رقم: AHD-1024
الاسم: ...
المدينة: ...
ملاحظة: ...
```

Matching example:

```text
السلام عليكم،
أرغب في طلب مطابقة لعاملة منزلية.
المدينة: الرياض
التوقيت: في أسرع وقت
الاحتياج: أعمال منزلية، رعاية أطفال
الخبرة بالسعودية: مهمة
الاستعداد: مباشرة
الاسم: ...
```

## Analytics
Track:
- worker/profile views
- request starts
- worker WhatsApp clicks
- transfer LP views
- matching form starts/steps
- matching WhatsApp clicks
- phone clicks

Never send customer name, phone, or free-text note to analytics.

## UX
Arabic RTL first, mobile first, one primary action, short forms, large touch targets, clear errors, fast pages, WCAG 2.2 AA.

## Trust
Never invent license claims, guarantees, fake reviews, response SLA, pricing, trial/return policy, or government affiliation.

## Scaling
> Architect for scale, deploy for current reality.

Keep web/API stateless, use PostgreSQL + object storage/CDN, and add Redis/queues/CRM only when a measured/business need exists.

## Out of Scope
- custom CRM/lead pipeline
- customer accounts
- payments
- bookings/calendars
- marketplace chat
- worker/provider accounts
- automated official-transfer integration
