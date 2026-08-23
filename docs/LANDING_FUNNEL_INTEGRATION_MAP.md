# AHD Landing Funnel and Integration Map

**Version:** 3.0 — Final WhatsApp-first funnel

## Main Site / Organic Path

```text
Homepage / SEO
→ public worker catalogue
→ worker profile
→ small validated specific-worker form
→ structured WhatsApp URL
→ AHD WhatsApp
→ sales / operations
→ official process outside the website
```

The catalogue and profile are backed by the public API. Only published and requestable workers are presented as active inventory. The worker’s public AHD reference is taken from API data and included in the message.

## Paid / Search Path

```text
Google Search
→ transfer landing page
→ need-based matching CTA
→ Step 1: household need
→ Step 2: contact/readiness/consent
→ structured WhatsApp URL
→ AHD WhatsApp
→ sales / operations
→ official process outside the website
```

The matching form uses temporary frontend state, shared validation, a pure message builder, and a configured WhatsApp destination. The website does not persist a matching request.

## Integration Boundaries

The active boundaries are the Express public/admin API, PostgreSQL, optional S3-compatible worker media, non-PII analytics events, and the configured WhatsApp URL handoff. No CRM, persistent `MATCHING_REQUEST`, lead assignment/status history, follow-up scheduler, queue notification, or customer account is part of the current funnel.

## Analytics

Measure catalogue/profile views, form starts, step completion, phone clicks, and WhatsApp clicks without customer name, phone, email, free-text note, full message, or private worker data. Completed-transfer attribution is manual initially.

## Future Boundary

CRM or automated messaging may become a separate future project only after an explicit product decision, operational need, data-retention review, and security/threat-model review. It is not a missing implementation task for the current MVP.
