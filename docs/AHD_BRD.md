# AHD (عهد) — Business Requirements Document

**Version:** 6.0 — Final Simplified CRUD + WhatsApp MVP
**Business model:** Domestic-worker discovery and sponsorship/service-transfer request platform
**Primary market:** Saudi Arabia

## 1. Business Objective

AHD enables the business to maintain domestic-worker inventory and enables customers to begin a structured conversation about either a specific worker or a household need. The website supports discovery, qualification, and handoff; sales and operations continue outside the website through the configured business WhatsApp channel and the approved official process.

```text
Admin manages inventory
→ customer discovers a published worker OR describes a household need
→ short form validates
→ WhatsApp conversation starts
→ sales / operations continue manually
```

The MVP is intentionally not a CRM and does not require customer request persistence.

## 2. Admin Business Requirements

An authorized operations user must be able to manage workers, nationalities/countries, skills, public content/FAQ blocks, and public contact settings without source-code changes to operational catalogue data. Worker operations include creating and editing drafts, publishing and unpublishing, archiving, changing availability, ordering/featuring, and managing approved media.

The business WhatsApp number and public phone/contact values must be configurable by authorized administration. Important operational changes must be auditable.

## 3. Public Discovery Requirements

Customers must be able to browse published worker profiles, search, filter by approved nationality/skill/availability dimensions, and view only approved public information. Draft, unpublished, archived, and otherwise non-requestable records must not appear as active public inventory.

## 4. Specific-Worker Conversion

The public journey is:

```text
Worker profile → اطلب هذه العاملة → short form → structured WhatsApp message → WhatsApp
```

The form may collect name, city, mobile number, and an optional note. The selected worker’s public reference must be inserted automatically from trusted application data. The website does not create a lead record.

## 5. Need-Based Matching

The paid/search landing page is matching-first:

```text
Google Search → transfer landing page → ابدأ طلب المطابقة → two-step form → WhatsApp
```

Step 1 asks for city, urgency, household needs, optional language preference, and optional Saudi-experience preference. Step 2 asks for name, mobile number, optional nationality preference, readiness, and privacy/consent acknowledgement. Email and budget are not required in the current MVP. The customer request is not stored by the website.

## 6. WhatsApp Handoff

After valid input, the website composes a structured Arabic message, URL-encodes it, and opens the configured business WhatsApp destination. The specific-worker message includes the trusted public worker reference. The matching message includes the structured qualification answers. The destination is configuration-driven and cannot be overridden by public input.

## 7. Measurement

Business conversion is measured as a WhatsApp conversation initiated. The application may track listing/profile views, landing-page and matching CTA events, form starts, step completion, worker WhatsApp clicks, matching WhatsApp clicks, and phone clicks. Analytics must not contain customer name, phone, email, free-text note, full message, or private worker data.

## 8. Trust Requirements

Public business copy must not publish unverified licenses, government affiliation, guarantees, response times, pricing, reviews, statistics, trial/return policies, or transfer outcomes. The experience must distinguish initial discovery and conversation from official approval or completed transfer.

## 9. MVP Acceptance Loop

```text
Admin creates worker
→ publishes worker
→ customer discovers worker or starts matching
→ form validates
→ correct WhatsApp message opens
```

## 10. Explicitly Not MVP / Future

The following are not current business requirements: CRM, lead assignment, lead status history, follow-up scheduler, customer accounts, worker accounts, bookings/calendars, payments, marketplace chat, automated WhatsApp Business messaging, official government API integration, Redis/BullMQ queue processing, or microservice decomposition. Any future addition requires a separate approved product decision and operational/security review.
