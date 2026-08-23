# AHD Architecture

**Version:** 2.0

```text
Public Web
  ├─ reads catalogue/content/settings
  └─ local form → WhatsApp deeplink
        │
      API
        │
   PostgreSQL
        │
 Object Storage

Admin Web → same API
```

MVP backend modules:
`Auth, AdminUsers, Workers, Nationalities, Skills, Media, Content, Settings, Audit`.

No CRM/Lead module is required.

PostgreSQL is the business source of truth. WhatsApp is the operational conversation handoff. Analytics stores behavioral events without PII.

Keep web/API stateless. Add Redis, queues, dedicated search, or CRM only when a real requirement/measurement justifies them.
