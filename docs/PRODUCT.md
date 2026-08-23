# AHD Product Definition

**Version:** 4.0 — Final WhatsApp-first MVP

## Product Identity

AHD / عهد is a Saudi domestic-worker discovery and sponsorship/service-transfer request website. It helps operations staff maintain a trustworthy published inventory and helps customers either discover a worker or describe a household need. The website validates the customer’s short form and opens a structured conversation with the configured business WhatsApp number. Sales and operations continue outside the website.

## Core MVP Loop

```text
Admin manages worker inventory, classifications, content, and contact settings
→ published data appears in the public website
→ customer selects a worker OR describes a household need
→ short form validates locally
→ structured WhatsApp URL opens
→ sales / operations continue outside the website
```

The MVP does not persist customer request forms. It does not require a CRM, lead pipeline, customer account, worker account, booking engine, payments, marketplace chat, Redis, BullMQ, or official government-transfer integration.

## Capabilities

The public experience provides a homepage, transfer/matching landing page, catalogue, search and filters, worker profiles, FAQ/contact content, and two small WhatsApp conversion forms. The admin experience provides authentication, worker CRUD, publication and availability controls, taxonomy management, media management, content/settings management, and audit logging for important changes. Basic analytics measure behavior without customer PII.

## Worker Information

The verified worker model supports an internal identifier, public AHD code, display name, nationality, age where approved, current city, experience, Saudi experience, skills, languages, public summary, media, availability, publication status, featured flag, and ordering. Internal operational fields remain outside public DTOs.

Availability is one of `AVAILABLE`, `ON_HOLD`, `RESERVED`, `TRANSFER_IN_PROGRESS`, `TRANSFERRED`, or `UNAVAILABLE`. Publication is one of `DRAFT`, `PUBLISHED`, or `ARCHIVED`. A worker is requestable through the public specific-worker form only when the backend’s publication and availability rules permit it.

## Specific-Worker Journey

```text
Public catalogue → worker profile → اطلب هذه العاملة → small validated form → structured WhatsApp URL → WhatsApp
```

The form may collect name, city, mobile number, and an optional note. The worker’s public AHD reference is taken from trusted API data and inserted automatically into the message. No public form creates a backend lead record.

## Need-Based Matching Journey

```text
Search / transfer landing page → ابدأ طلب المطابقة → Step 1 → Step 2 → validation → structured WhatsApp URL → WhatsApp
```

Step 1 collects city, urgency, household needs, optional language preference, and optional Saudi-experience preference. Step 2 collects name, mobile number, optional nationality preference, readiness, and privacy/consent acknowledgement. Email and budget are not part of the V1 form. No matching request is persisted.

## Analytics and Privacy

The application may track views, form starts, step completion, WhatsApp clicks, and phone clicks. Analytics properties may contain approved public worker references or safe counts, but never customer name, phone, email, free-text note, full WhatsApp message, or private worker data. Form data remains temporary frontend state and is not written to localStorage or sessionStorage by default.

## Trust and Compliance

AHD must not invent licenses, government affiliation, guarantees, response SLAs, pricing, reviews, statistics, trial/return policies, or transfer outcomes. Public copy should explain that the catalogue and matching flow support an initial conversation, not a guarantee of availability, approval, timing, or cost.

## Future Scope

CRM, lead persistence, queues, Redis, official integrations, customer accounts, worker accounts, booking, payments, and automated WhatsApp Business messaging are **FUTURE / NOT MVP**. Introduce any of them only through an explicit product decision supported by operational need and a separate security/data-model review.
