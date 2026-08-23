# AHD Acceptance Criteria

**Version:** 3.0

## Admin
- [ ] Worker CRUD works.
- [ ] Nationality/country CRUD works.
- [ ] Skill CRUD works.
- [ ] Admin can publish/unpublish/archive.
- [ ] Admin can configure WhatsApp/public contact settings.
- [ ] Public output updates without code deployment.

## Public Catalogue
- [ ] Published workers appear.
- [ ] Draft/archived workers do not appear as active inventory.
- [ ] Public API never exposes internal notes/private data.
- [ ] Search/filters and profiles work on mobile.

## Specific Worker WhatsApp
- [ ] `اطلب هذه العاملة` opens a small form.
- [ ] Form validates.
- [ ] Worker public code is included automatically.
- [ ] Correct WhatsApp URL is generated.
- [ ] Destination number is config-driven.
- [ ] No Lead record is required.

## Paid Matching LP
- [ ] One dominant CTA: `ابدأ طلب المطابقة`.
- [ ] Two-step form works.
- [ ] Email/budget are not required.
- [ ] Valid answers generate a structured WhatsApp message.
- [ ] Catalogue browsing is not required.

## Analytics
- [ ] Views/form steps/WhatsApp clicks are tracked.
- [ ] PII is not sent to analytics.

## Quality
- [ ] Server-side admin authorization.
- [ ] WCAG 2.2 AA baseline.
- [ ] Optimized images/minimal JS.
- [ ] Horizontal web/API scaling remains possible.

## Final MVP
```text
Admin creates worker
→ publishes
→ customer discovers or matches
→ form validates
→ correct WhatsApp message opens
```
