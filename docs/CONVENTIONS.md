# AHD Engineering Conventions

## Source of Truth

The active frontend is in `artifacts/khadematy-site`; the active backend is in `laravel-api`. MySQL migrations and Eloquent models in `laravel-api` define the current backend. `artifacts/api-server`, `lib/db`, and `db/migrations` are superseded reference material and must not be extended as the production path.

## Frontend

Use React 19 with TypeScript, Vite, wouter, Tailwind CSS, and the existing Arabic RTL design system. Preserve route semantics, accessible names, focus behavior, compact mobile layouts, and the existing visual language. Keep customer form state temporary. Use shared Zod schemas and pure WhatsApp message builders; do not add backend lead calls or localStorage/sessionStorage PII.

## Laravel API

Keep controllers thin enough to expose explicit route behavior, use request validation at the boundary, and return the existing camelCase DTOs/envelopes expected by the frontend. Put reusable mapping and policy behavior in clearly named private methods or services. Public DTO methods must be allowlists. Admin mutations must use server-side middleware and never depend on frontend visibility.

Use Laravel route definitions in `routes/api.php`, middleware aliases in `bootstrap/app.php`, Eloquent relationships for domain associations, and `DB::transaction` for worker-plus-skill changes. Use `Str::uuid()` for identifiers and never expose session tokens or password hashes.

## MySQL and Migrations

Use `utf8mb4`, explicit foreign keys, unique constraints, and indexes for public filters. Add schema changes as new Laravel migration files. Run `php artisan migrate --force`; never create or alter production schema from a request handler. Verify migrations on real disposable MySQL, not only SQLite. Seeders must be explicit, environment-driven, and must not create an admin account when credentials are absent.

## Media

Use Laravel Filesystem disks. Shared-hosting local/public storage must use controlled paths and a protected storage link. S3-compatible storage is optional configuration. Validate MIME type, size, worker ownership, and production HTTPS URLs. Never claim binary upload or public retrieval is production-verified without an authorized external storage check.

## Naming and Compatibility

Laravel persistence fields remain snake_case; API payloads use the frontend contract such as `displayName`, `nationalityName`, `nationalityId`, `skillIds`, `contentAr`, and `isActive`. The admin worker form accepts nationality as typed text, while the Laravel boundary resolves it to the normalized `nationality_id` relation; direct `nationalityId` input remains compatible. Normalize aliases at the request boundary and use explicit status values without inventing commercial worker fields not present in the active schema.

## Scope and Review

Do not add CRM, leads, queues, Redis, BullMQ, accounts, bookings, payments, or government integrations. Every change must preserve lint, typecheck, tests, build, audit, PHP syntax, Laravel feature tests, migration status, and the relevant browser golden slice. Documentation must distinguish current authority from historical artifacts.
