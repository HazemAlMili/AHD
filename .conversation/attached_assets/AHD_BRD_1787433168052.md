# AHD (عهد) — Business Requirements Document

**Version:** 5.0 — Simplified CRUD + WhatsApp MVP
**Business Model:** Domestic Worker Discovery & WhatsApp Request Platform
**Primary Market:** Saudi Arabia

## 1. Business Model
AHD lets the business manage domestic-worker inventory and lets customers start a structured WhatsApp conversation about a specific worker or household need.

Core loop:

```text
Admin CRUD
→ Public Catalogue / Matching LP
→ Simple Form
→ WhatsApp
→ Sales / Operations
→ Approved Official Transfer Process
```

The MVP intentionally does not include a custom CRM.

## 2. Admin Requirements
Admin Dashboard is mandatory.

Core navigation:
```text
Dashboard
Workers
Nationalities / Countries
Skills
Content
Settings
```

Admin can create/read/update/archive workers, publish/unpublish, change availability, upload media, feature/reorder, and manage classifications.

Admin also manages:
- nationalities/countries
- skills
- public content/FAQ where appropriate
- business WhatsApp number
- public phone/contact details

No operational catalogue data should require source-code modification.

## 3. Worker Data
Recommended:
- internal ID
- public code/reference
- display name
- nationality/country
- age if approved
- city
- experience
- Saudi experience
- skills
- languages
- salary/transfer amount if approved
- public description
- image/gallery
- availability
- publication
- featured/order
- internal notes

Availability:
`AVAILABLE, ON_HOLD, RESERVED, TRANSFER_IN_PROGRESS, TRANSFERRED, UNAVAILABLE`

Publication:
`DRAFT, PUBLISHED, ARCHIVED`

## 4. Public Catalogue
Public website supports:
- worker listing
- worker profile
- search
- nationality/country filter
- skill filter
- availability filter
- experience indicators

Only approved public data is exposed.

## 5. Specific Worker Conversion
Flow:

```text
Worker Profile
→ اطلب هذه العاملة
→ Small Form
→ Structured WhatsApp Message
→ WhatsApp
```

Suggested form:
- name
- city
- mobile if useful
- optional note

The selected worker code/name is attached automatically.

No Lead record is required in the website backend.

## 6. Paid Matching Landing Page
Paid funnel:

```text
Google Search
→ Transfer LP
→ ابدأ طلب المطابقة
→ Two-Step Matching Form
→ WhatsApp
```

The page is Need-Based Matching first and does not require catalogue browsing.

Structure:
```text
Minimal Header
→ Hero
→ Trust
→ Problem
→ Transfer vs Recruitment Context
→ Need-Based Matching
→ Need Categories
→ Process
→ What You Get
→ Pricing Explanation
→ Trust/Proof
→ For / Not For
→ FAQ
→ Matching Form
→ Final CTA
```

Primary CTA:
**ابدأ طلب المطابقة**

## 7. Matching Form
Step 1:
- city
- urgency
- household needs
- language optional
- previous Saudi experience preference optional

Step 2:
- name
- mobile if required
- nationality preference optional and approval-dependent
- readiness
- privacy/consent acknowledgement

V1:
- no mandatory email
- no budget field

## 8. WhatsApp Handoff
After valid input, the website creates a prefilled WhatsApp message and opens the configured business WhatsApp number.

The number must be admin/configuration-driven.

Specific-worker message includes worker public reference.

Matching message includes structured qualification answers.

## 9. Conversion Metrics
Primary MVP conversion:
**WhatsApp Conversation Initiated**

Track separately:
- Worker WhatsApp click
- Matching WhatsApp click

Website funnel metrics:
- page/LP view
- CTA click
- form start
- Step 1 completion
- Step 2 completion
- WhatsApp click
- mobile drop-off

Completed transfer can initially be reconciled manually by sales/operations.

## 10. Main Website vs Paid LP
Main website:
- brand/SEO
- catalogue
- profiles
- specific-worker WhatsApp

Paid LP:
- message match
- qualification
- matching WhatsApp

## 11. Trust / Compliance
Do not publish unverified:
- license wording
- government affiliation
- guarantees
- response times
- pricing claims
- reviews/statistics
- trial/return policy
- failed-transfer policy

## 12. MVP Scope
Public:
- homepage
- paid transfer LP
- catalogue
- worker profile
- search/filters
- two simple request forms
- WhatsApp handoff
- FAQ/legal/contact
- analytics

Admin:
- auth
- Worker CRUD
- nationality/country CRUD
- skill CRUD
- media
- publish/status
- content/settings
- basic audit/permissions

## 13. Out of Scope
- custom CRM
- lead assignment/status history
- follow-up scheduler
- customer accounts
- payments
- bookings/calendars
- automated WhatsApp Business messaging
- official government API integration
- Redis/BullMQ solely for request handling

## 14. MVP Success
```text
Admin creates worker
→ publishes
→ worker appears
→ customer requests worker OR uses matching LP
→ form validates
→ correct WhatsApp message opens
```
