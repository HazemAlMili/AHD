# AHD Business Requirements Document

## Business Objective

AHD shall provide a trustworthy digital starting point for customers seeking a domestic-worker service-transfer option in Saudi Arabia. It shall help operations staff publish understandable worker profiles and help customers begin a structured business conversation through WhatsApp.

## Customer Outcomes

Customers shall be able to understand what AHD offers, browse the published catalogue, inspect a worker profile, or describe a household need in a short two-step matching flow. They shall receive a clear next step without being promised availability, approval, price, timing, or a completed transfer.

## Operations Outcomes

Authorized staff shall be able to maintain the worker catalogue, nationalities, skills, public content, contact settings, media metadata, publication state, availability state, featured ordering, and an operational audit trail. Published changes shall be reflected in the public catalogue through the approved application path.

## Required Business Journeys

| Journey | Required result |
|---|---|
| Public discovery | Customer opens the homepage, catalogue, filters, and a published worker profile. |
| Specific-worker request | Customer enters a short form and opens a structured WhatsApp message containing the trusted worker code. |
| Need-based matching | Customer completes Step 1 and Step 2, gives consent, and opens a structured WhatsApp message. |
| Catalogue operations | Authorized staff create or update a worker, assign nationality and skills, save, publish, change availability, or archive. |
| Content operations | Authorized staff update approved public content and contact settings. |

## Business Rules

Only workers approved for publication and currently requestable may appear as requestable public options. Public profiles shall expose only approved public information. Internal notes, audit information, private media, and administrative metadata shall not appear in the customer experience.

The WhatsApp destination shall be controlled by AHD configuration. Customers may provide information for the message, but they shall not override the business destination. Forms are temporary handoff preparation; AHD shall not create a lead, customer record, matching-request record, CRM pipeline, queue, or booking record.

## Scope Exclusions

The MVP shall not include CRM, lead persistence, customer or worker accounts, booking, hourly scheduling, payments, marketplace messaging, Redis, BullMQ, background queues, Kafka, microservices, or official government-transfer integration. These exclusions are intentional business boundaries.

## Non-Functional Business Expectations

The production deployment must support conventional PHP/MySQL shared hosting, standard HTTPS, static React assets, secure administration, Arabic RTL content, and reliable data publication. Production readiness requires verification on the intended hosting account; local MySQL and local HTTPS-like checks do not prove shared-hosting readiness.

## Acceptance Ownership

Product acceptance covers customer and operations behavior. Technical acceptance is defined in `docs/AHD_TRD.md`, `docs/API.md`, `docs/SECURITY.md`, `docs/TESTING.md`, and `docs/ACCEPTANCE_CRITERIA.md`. No technical implementation may expand the business scope without an explicit approved change.
