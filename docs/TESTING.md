# AHD Testing Strategy

**Version:** 4.0 — Verified Quality and Staging Strategy

Testing is layered. Static repository gates prove build and dependency integrity; unit and integration checks prove domain/security behavior; configured staging proves the built application against a real disposable database and browser; deployment-specific storage/HTTPS checks remain environment gates.

## Repository Gates

Run the same sequence used by `.github/workflows/ci.yml`:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
PORT=3001 BASE_PATH=/ pnpm build
pnpm audit --audit-level=high
```

The required audit classification is zero HIGH and zero CRITICAL vulnerabilities. Existing non-fatal lint warnings and the known Vite tooltip source-map warning must not be confused with failing gates.

## Unit and Authorization Coverage

The current test suite covers publication/requestability rules, approved form validation, deterministic Arabic WhatsApp message builders and encoding, and admin role middleware. Public mutation denial and insufficient-role behavior are security invariants, not optional UI behavior.

## Database and API Integration

Configured staging or a disposable non-production target must verify fresh migration, migration rerun, status, compatible existing-schema adoption, readiness, admin login/session, worker CRUD, taxonomy relations, publication, availability, media ownership, settings, public DTO privacy, and understandable error responses. Use synthetic data only and remove or destroy it after verification.

## Browser Golden Slices

The required browser journeys are:

```text
Admin login → create worker → taxonomy/media → publish → public appearance
Worker profile → validated specific-worker form → correct WhatsApp URL
Matching landing page → Step 1 → Step 2 → consent → correct WhatsApp URL
Direct/refresh thank-you route → truthful state without browser PII persistence
```

Verify catalogue, profile, filters, forms, admin login/workers, and thank-you behavior at representative 390px mobile, 768px tablet, and 1440px desktop widths. Confirm Arabic RTL, primary CTA usability, no unbounded page overflow, and an understandable unavailable-API state.

## Accessibility

Use `scripts/src/browser-audit.mjs` with a compatible Chromium CDP session where possible. The audit checks accessible names, labels, duplicate IDs, missing image alt text, layout overflow, `lang`/`dir`, and axe-core WCAG 2.2 AA violations. Manually inspect keyboard/focus behavior, required-state messaging, semantic buttons/links, and the intentional horizontal scroll container in the dense admin table.

## Security and Privacy

Verify server-side admin authorization, public mutation denial, explicit CORS allowlist, cookie attributes when HTTPS exists, explicit public DTOs, media ownership/HTTPS policy, configuration-driven WhatsApp destination, dependency audit, and analytics PII filtering. Analytics must not contain customer name, phone, email, free-text note, or the full message.

## Performance and Runtime Observation

Record meaningful findings from browser console/network inspection: blocking runtime errors, failed application requests, mixed content, CORS failures, missing assets, repeated API loops, or catastrophic layout/bundle problems. Source-map-only build warnings are non-blocking when the build succeeds. Do not perform speculative optimization.

## Evidence Classification

Use **STAGING PASS** only when all materially required checks available to the environment pass. Use **STAGING PASS WITH EXTERNAL BLOCKERS** when repository-controlled behavior is clean but real HTTPS, S3, or other external platform configuration is unavailable. Use **STAGING FAIL** when a repository-controlled runtime, security, or functional defect remains.
