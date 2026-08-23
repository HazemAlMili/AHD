# AHD Engineering Conventions

**Version:** 4.0 — Current Runtime Conventions

## Language and Domain

Use strict TypeScript. Prefer the domain terms `Worker`, `Nationality`, `Skill`, `PublicationStatus`, `WorkerAvailabilityStatus`, `PublicSettings`, and `WhatsAppMessageBuilder`. Do not use CRM `Lead` terminology in current MVP code unless a future approved scope explicitly introduces it.

## Runtime Boundaries

The maintained frontend is React 19 + Vite + wouter. It is not a Next.js application and has no Server Components convention. Keep short customer forms in local React state; do not add browser persistence for customer PII by default. The API is Express 5. Keep server startup and environment requirements explicit.

The database is PostgreSQL accessed through parameterized `pg` queries. Drizzle declarations in `lib/db` are useful for schema/types, but versioned SQL under `db/migrations` is the migration authority. Use `pnpm db:status` and `pnpm db:migrate`; do not use Prisma migrations or a development-only schema push as the current workflow.

## API and Privacy

Use explicit public DTOs and never serialize full database records publicly. Backend code owns authorization, publication/availability rules, settings, and public/private projection. Validate API input with Zod. Preserve the distinction between public read routes and protected admin mutation routes.

Keep WhatsApp formatting in pure reusable functions: `buildWorkerRequestMessage`, `buildMatchingRequestMessage`, and `buildWhatsAppUrl`. Take worker references from trusted API data, normalize the configured destination, and URL-encode messages. Never send customer name, phone, email, free-text note, or the full message to analytics.

## UI and Accessibility

Preserve Arabic-first RTL behavior, mobile-first layouts, semantic buttons/links, explicit labels, visible focus states, understandable errors, and WCAG 2.2 AA targets. Do not redesign or add fields when the approved MVP already satisfies the requirement.

## Change Verification

Before Done, run the relevant unit tests and then the repository gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `PORT=3001 BASE_PATH=/ pnpm build`, and `pnpm audit --audit-level=high`. For changes affecting browser behavior, run the repository axe/layout audit where a CDP session is available. Update canonical documentation when implementation truth changes.
