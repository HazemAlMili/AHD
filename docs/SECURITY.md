# AHD Security and Permission Boundaries

The MVP protects admin access, worker internal data, and business settings.

Public WhatsApp forms use temporary client state:
```text
validate → build message → open WhatsApp
```

No custom customer/lead DB is required.

Do not:
- store form PII in localStorage/sessionStorage by default,
- send name/phone/free text to analytics,
- allow public input to override WhatsApp destination,
- expose internal notes/secrets.

WhatsApp destination comes from trusted public settings and message text must be URL encoded.

Admin requires secure sessions, server-side authorization, safe uploads, and audit for important changes.

Any future CRM or official integration requires separate security review.
