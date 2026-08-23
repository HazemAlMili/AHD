# AHD Testing Strategy

Unit:
- worker publication/requestability
- validation
- WhatsApp message builders/encoding
- permissions

Integration:
- Worker CRUD
- nationality/skill relations
- public settings
- public DTO privacy
- admin authorization

E2E:
```text
Admin login → create worker → publish → public appearance
Worker profile → request form → correct WhatsApp URL
Paid LP → Step 1 → Step 2 → correct WhatsApp URL
```

Security:
- public cannot access admin
- internal fields not public
- WhatsApp destination cannot be overridden by public input

Accessibility:
- catalogue/profile/forms/admin CRUD

Analytics:
- expected events fire
- no PII

CI:
`lint → typecheck → unit → integration → build → critical E2E`
