# AHD Landing Funnel and Integration Map

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

The React/Vite catalogue and profile read approved public DTOs from the Laravel API backed by MySQL. Only published and requestable workers are presented as active inventory. The worker's trusted public AHD reference is inserted into the specific-worker message.

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

The current application boundary is React/Vite, Laravel/MySQL, optional local/public or S3-compatible worker media, safe non-PII analytics, and the configured WhatsApp handoff. There is no CRM, lead assignment/status history, follow-up scheduler, queue notification, customer account, customer database, booking, or payment integration.

## Analytics

Measure catalogue/profile views, form starts, step completion, phone clicks, and WhatsApp clicks without customer name, phone, email, free-text note, full message, or private worker data. Completed-transfer attribution is manual initially.

## Future Boundary

CRM or automated messaging may become a separate future project only after an explicit product decision, operational need, data-retention review, and security/threat-model review. It is not a missing implementation task for the current MVP.
