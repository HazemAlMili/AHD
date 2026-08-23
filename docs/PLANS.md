# PLANS.md — AHD Agent Execution & Planning Protocol

**Version:** 2.0  
**Purpose:** Define the mandatory planning and execution discipline for all large, risky, cross-module, migration-heavy, architecture-impacting, or conversion-critical work in AHD.

This file is not the project roadmap.

The project roadmap lives in:

```text
EXECUTION_PLAN.md
```

This file defines **how an agent must plan and execute substantial work** so that implementation converges quickly, safely, and with the fewest avoidable retries.

---

# 1. Core Execution Principle

The agent must optimize for:

> **Correctness on the first complete implementation attempt, not speed on the first code edit.**

The required operating model is:

```text
Understand
→ Verify
→ Lock Scope
→ Plan
→ Implement Small
→ Validate
→ Integrate
→ Re-Validate
→ Close
```

The agent must not jump directly from task text to broad code changes.

---

# 2. When a Full Plan Is Required

Create or update a plan when the task is any of the following:

- Crosses more than one major application/module.
- Changes database schema.
- Changes API contracts.
- Changes authentication or authorization.
- Changes worker publication or availability rules.
- Changes lead/request lifecycle.
- Changes public/private/sensitive data handling.
- Changes critical conversion flows.
- Introduces a third-party integration.
- Introduces caching, queues, concurrency, or background jobs.
- Changes deployment or infrastructure.
- Changes analytics taxonomy.
- Changes a critical shared component.
- Is a refactor with meaningful regression risk.
- Is difficult to safely complete in one isolated edit.

A plan is usually not required for:

- Typo fixes.
- Small copy updates.
- Small isolated styling fixes.
- Minor tests for already-defined behavior.
- Tiny refactors with no contract change.

When uncertain, prefer a short plan over unstructured execution.

---

# 3. Mandatory Read Order Before Planning

Before planning a substantial change, the agent must inspect the relevant source of truth.

Minimum read order:

```text
1. PRODUCT.md
2. ARCHITECTURE.md
3. AGENTS.md
4. CONVENTIONS.md
5. SECURITY.md
6. API.md
7. TESTING.md
8. ACCEPTANCE_CRITERIA.md
9. EXECUTION_PLAN.md
10. Current implementation in affected modules
```

Read only the parts relevant to the task, but do not skip a document when the task clearly touches its domain.

Examples:

### Database change

Must inspect:

```text
ARCHITECTURE.md
CONVENTIONS.md
prisma/schema.prisma
existing migrations
affected repository/service code
TESTING.md
```

### Admin permission change

Must inspect:

```text
SECURITY.md
AGENTS.md
API.md
auth module
permission guards
relevant E2E tests
```

### Public conversion change

Must inspect:

```text
PRODUCT.md
ACCEPTANCE_CRITERIA.md
analytics taxonomy
existing funnel implementation
affected UI
TESTING.md
```

---

# 4. The Preflight Gate

No substantial implementation begins before the Preflight Gate is complete.

The agent must establish the following.

## 4.1 Problem Statement

Write one concise statement:

```text
The problem is:
...
```

It must describe the actual business or technical problem, not merely repeat the requested code change.

---

## 4.2 Expected Outcome

Write:

```text
After this change:
...
```

The outcome must be observable.

Bad:

```text
Improve worker logic.
```

Good:

```text
After this change, an admin can reserve an AVAILABLE worker and concurrent reservation attempts cannot create two valid reservations.
```

---

## 4.3 Scope Lock

Explicitly state:

```text
Included:
- ...

Excluded:
- ...
```

Do not silently expand scope while implementing.

If new work becomes necessary, add it to the plan before implementing it.

---

## 4.4 Source-of-Truth Check

Identify where authoritative behavior belongs.

Examples:

```text
Worker requestability → Backend domain logic
Worker data → PostgreSQL
Public worker visibility → Backend query/publication rules
Admin permissions → Server-side authorization
Cache → Redis, never authoritative
Files → Object storage
```

Never implement the same business rule independently in multiple clients.

---

## 4.5 Dependency Check

List what the task depends on.

Examples:

- Existing DB entity.
- Existing API endpoint.
- Existing permission.
- Existing worker state model.
- Existing analytics event.
- Existing design-system primitive.

Mark each dependency:

```text
READY
MISSING
NEEDS CHANGE
```

A missing dependency must be resolved before downstream code is treated as final.

---

## 4.6 Existing Behavior Check

Before changing code, inspect the current behavior.

The agent should establish:

- What currently happens?
- Which code owns it?
- Which tests currently prove it?
- Is the current behavior intentional or accidental?
- What other modules consume it?

Do not replace existing logic without first locating its consumers.

---

## 4.7 Acceptance Criteria

Define exact success conditions before implementation.

Use observable checks.

Example:

```text
[ ] Draft worker is never public.
[ ] Published + AVAILABLE worker is requestable.
[ ] Published + RESERVED worker is not normally requestable.
[ ] Public API never returns internal notes.
[ ] Cache is invalidated when availability changes.
```

If success cannot be stated clearly, the task is not ready to implement.

---

# 5. Risk Classification

Every substantial task should be classified.

## LOW

Examples:

- isolated display component
- small content-management field
- local UI enhancement

Execution:

```text
Plan
→ Implement
→ Relevant tests
```

## MEDIUM

Examples:

- new API endpoint
- new admin CRUD workflow
- new search filter
- analytics event changes

Execution:

```text
Plan
→ Contract check
→ Implement
→ Unit/integration tests
→ E2E where relevant
```

## HIGH

Examples:

- schema migration
- auth/permissions
- worker reservation
- private documents
- production caching
- external integrations
- deployment changes

Execution:

```text
Plan
→ Contract review
→ Failure analysis
→ Migration/rollback strategy
→ Small implementation steps
→ Integration tests
→ E2E
→ Security review
→ Regression check
```

---

# 6. Plan Structure

Use the following structure for substantial work.

---

## Title

Short, specific, outcome-oriented.

Example:

```text
Concurrency-Safe Worker Reservation
```

---

## Problem

What is wrong or missing?

Why does it matter?

---

## User / Business Impact

Who benefits?

What business outcome changes?

Relevant examples:

- Lower operational conflict.
- Better worker availability accuracy.
- Higher request conversion.
- Reduced admin workload.
- Lower privacy risk.

---

## Current Behavior

Describe what the system does before the change.

Reference affected modules.

---

## Desired Behavior

Describe what should happen after the change.

---

## Scope

### Included

- ...

### Excluded

- ...

---

## Dependencies

| Dependency | Status | Notes |
|---|---|---|
| Worker model | READY | Existing |
| Reservation state | READY | `RESERVED` exists |
| Lead-worker relation | NEEDS CHANGE | Add reservation relation |

---

## Affected Modules

Possible values:

```text
web
admin
api
database
queue
cache
analytics
infrastructure
docs
```

---

## Data Model Changes

Describe:

- New models.
- New fields.
- New constraints.
- New indexes.
- Relation changes.
- Migration.
- Backfill.
- Compatibility.
- Rollback risk.

If no data changes:

```text
None.
```

---

## API Changes

List:

- New endpoints.
- Modified endpoints.
- Request/response changes.
- Error codes.
- Compatibility implications.

---

## Domain Rules

Write rules explicitly.

Example:

```text
A worker may transition to RESERVED only from AVAILABLE.
```

Avoid hiding important rules inside prose.

---

## Permissions

Specify:

```text
Who can read?
Who can create?
Who can update?
Who can delete/archive?
Who can perform sensitive actions?
```

---

## UX Changes

For public or admin UI, define:

- User goal.
- Primary action.
- Loading state.
- Empty state.
- Error state.
- Mobile behavior.
- Accessibility requirements.

---

## Analytics

List:

- Events added.
- Events changed.
- Server-side milestones.
- Properties.
- Primary metric.
- Guardrails.

If analytics are not relevant:

```text
None.
```

---

## Security Impact

Evaluate:

- Authentication.
- Authorization.
- Sensitive data.
- Public/private boundaries.
- File access.
- Injection/input risks.
- Logging exposure.
- Abuse potential.

---

## Scalability Impact

Evaluate:

- Read volume.
- Write volume.
- Query pattern.
- Index needs.
- Cache behavior.
- Queue behavior.
- Concurrency.
- Idempotency.
- Horizontal scaling.

---

## Failure Modes

List realistic failures before implementing.

Example:

```text
- Two admins reserve the same worker simultaneously.
- Cache shows AVAILABLE after DB changed to RESERVED.
- Notification succeeds although reservation transaction fails.
```

For each meaningful failure, define expected behavior.

---

## Implementation Steps

Steps must be small enough to validate independently.

Good:

```text
1. Add DB constraint.
2. Add migration.
3. Add repository method.
4. Add domain transition.
5. Add API endpoint.
6. Add admin UI action.
7. Add cache invalidation.
8. Add tests.
```

Bad:

```text
1. Implement reservations.
```

---

## Test Plan

### Unit

- ...

### Integration

- ...

### E2E

- ...

### Security

- ...

### Accessibility

- ...

### Performance

- ...

### Concurrency

- ...

Only include applicable layers.

---

## Rollout

Define:

- Migration order.
- Deploy order.
- Feature flag if required.
- Cache invalidation.
- Background jobs.
- Monitoring.

---

## Rollback

Define the safest reverse path.

For schema changes, state whether rollback is:

```text
SAFE
DATA-LOSS RISK
FORWARD-FIX ONLY
```

---

## Acceptance Criteria

Use checkboxes.

```text
[ ] ...
[ ] ...
```

---

# 7. The Implementation Cycle

Once the plan is approved by the task context, execute using the following cycle.

```text
Preflight
↓
Small Change
↓
Immediate Check
↓
Next Change
↓
Focused Tests
↓
Integration Check
↓
Regression Check
↓
Acceptance Gate
```

The agent should avoid making a large number of unvalidated edits before running any checks.

---

# 8. Step-by-Step Execution Protocol

## Step 1 — Establish a Clean Baseline

Before editing:

- Run relevant existing tests when practical.
- Confirm current build state.
- Note unrelated existing failures.
- Do not attribute pre-existing failures to the new change.

---

## Step 2 — Implement the Lowest-Level Contract First

Typical order:

```text
Schema / Types
→ Domain Rule
→ Repository
→ API
→ Admin/Public UI
→ Analytics
```

This order may vary, but authoritative contracts should exist before dependent presentation logic.

---

## Step 3 — Validate Immediately After Each Risky Layer

Examples:

After migration:

```text
Run migration
Validate schema
Run DB integration test
```

After authorization:

```text
Test allowed role
Test denied role
```

After API:

```text
Test success
Test validation failure
Test forbidden
Test missing entity
```

Do not wait until the end to discover foundational errors.

---

## Step 4 — Integrate With Real Data

Before phase/task completion:

- Remove critical mocks.
- Use actual API.
- Use actual DB behavior.
- Use real permission checks.
- Verify actual state transitions.

Fixtures are allowed for tests and local development.

Production behavior must be integrated.

---

## Step 5 — Test Failure Paths

For every critical happy path, test at least the likely failure paths.

Examples:

### Lead submission

Happy:

```text
Available worker + valid customer → lead created
```

Failures:

```text
Unavailable worker
Invalid phone
Duplicate accidental submission
DB error
Notification provider error
```

---

## Step 6 — Regression Check

Before declaring success, inspect adjacent behavior.

Ask:

- Did public worker listing change?
- Did admin permissions weaken?
- Did API response shape change?
- Did query count grow significantly?
- Did caching become stale?
- Did mobile UX regress?
- Did sensitive data leak into logs/analytics?

---

## Step 7 — Documentation Sync

If implementation changes a contract, update the relevant documentation in the same work.

Examples:

| Change | Update |
|---|---|
| API contract | `API.md` |
| Architecture | `ARCHITECTURE.md` |
| Product behavior | `PRODUCT.md` / BRD |
| Security boundary | `SECURITY.md` |
| Test policy | `TESTING.md` |
| Acceptance behavior | `ACCEPTANCE_CRITERIA.md` |
| Agent rules | `AGENTS.md` |
| PostgreSQL schema | `db/migrations` SQL + `lib/db/schema` declarations |

Documentation must describe reality, not future intention.

---

# 9. Verification Ladder

Use the cheapest useful verification first, then escalate.

```text
1. Static check
2. Type check
3. Unit test
4. Integration test
5. E2E
6. Manual UX verification
7. Performance/security/load verification
```

Not every task needs all seven levels.

Critical tasks may require all applicable levels.

---

# 10. The Three-Gate Confirmation System

Every substantial task must pass three gates.

---

## Gate A — Before Code

Confirm:

```text
[ ] Problem understood.
[ ] Scope locked.
[ ] Dependencies known.
[ ] Source of truth known.
[ ] Acceptance criteria written.
[ ] Security/privacy impact considered.
[ ] Existing behavior inspected.
```

No Gate A → no broad implementation.

---

## Gate B — Before Integration Is Declared Complete

Confirm:

```text
[ ] Core implementation exists.
[ ] Data contract is correct.
[ ] Backend business rules are authoritative.
[ ] Permissions work.
[ ] Focused tests pass.
[ ] Failure paths are handled.
[ ] UI uses real API/data.
```

---

## Gate C — Before Task Completion

Confirm:

```text
[ ] Acceptance criteria pass.
[ ] Relevant regression tests pass.
[ ] Build/typecheck/lint pass.
[ ] Security boundaries remain intact.
[ ] Accessibility checked where relevant.
[ ] Analytics updated where relevant.
[ ] Performance considered where relevant.
[ ] Documentation matches implementation.
[ ] No temporary production hacks remain.
```

---

# 11. Stop Conditions

The agent should stop expanding implementation and reassess when:

- Requirements conflict with `PRODUCT.md`.
- Two source-of-truth documents disagree materially.
- A required dependency is missing.
- A proposed change weakens security boundaries.
- A migration would risk data loss without explicit handling.
- A third-party API is undocumented or unauthorized.
- A business rule is ambiguous and cannot be safely inferred.
- The same failure repeats after two materially different fixes.
- A fix requires unexpected architecture expansion.

Stopping means:

```text
Diagnose
→ Update Plan
→ Narrow Scope
→ Continue
```

It does not mean repeatedly trying random alternatives.

---

# 12. Retry Discipline

The agent must not enter an uncontrolled retry loop.

After a failure:

## First Failure

```text
Read actual error
→ identify layer
→ form one hypothesis
→ make smallest corrective change
→ rerun focused check
```

## Second Failure

If the same class of failure remains:

```text
Re-read assumptions
→ inspect neighboring contracts
→ verify dependency/version/config
→ update plan if understanding changed
```

## Third Attempt Rule

Do not make a third speculative fix.

Before a third attempt:

- Reproduce minimally.
- Inspect authoritative docs/code.
- Confirm root cause.
- Narrow the change.

The objective is fewer, better attempts.

---

# 13. Debugging Order

When a flow fails, inspect in this order:

```text
1. Input / reproduction
2. Frontend request
3. API route
4. Validation
5. Authorization
6. Domain logic
7. Database/query
8. Cache
9. Queue
10. External provider
11. Response/rendering
```

Do not start by rewriting unrelated code.

---

# 14. Change Size Rule

Prefer small coherent changes over large mixed patches.

Good task boundary:

```text
Add worker publication validation.
```

Bad task boundary:

```text
Rewrite worker management, search, homepage, analytics, and auth.
```

Large features should be split into ordered sub-steps while preserving one overall plan.

---

# 15. Vertical Slice Rule

For product functionality, prefer completing one vertical slice before broadening.

Example:

```text
Worker create
→ Worker publish
→ Public read
→ Test
```

before adding ten advanced worker fields.

Similarly:

```text
Worker request
→ validated WhatsApp handoff
→ Test
```

before adding advanced CRM automation or request persistence.

---

# 16. Database Change Protocol

For schema changes:

```text
1. Update plan.
2. Define migration.
3. Define data compatibility.
4. Add indexes/constraints.
5. Run migration locally.
6. Run integration tests.
7. Verify rollback/forward-fix strategy.
8. Update schema documentation if needed.
```

Never manually patch production schema.

---

# 17. API Change Protocol

Before changing an endpoint:

```text
Check current consumers
→ define new contract
→ update backend
→ update tests
→ update clients
→ update API.md
```

Avoid accidental breaking changes.

---

# 18. Security-Sensitive Change Protocol

For changes involving:

- authentication
- authorization
- private documents
- admin permissions
- customer phone numbers
- sensitive worker fields
- file uploads

the plan must include:

```text
Threat / abuse case
Authorization rule
Data exposure rule
Logging rule
Test case
```

Security is not considered complete through UI hiding.

---

# 19. Conversion-Critical Change Protocol

For changes affecting:

```text
Worker Listing
Worker Profile
Request CTA
Request Form
Homepage Discovery
Help Me Find a Worker
```

the plan must include:

```text
User goal
Current friction
Expected improvement
Primary metric
Guardrail metrics
Analytics event impact
Mobile impact
Accessibility impact
Performance impact
```

---

# 20. Caching Change Protocol

Before adding caching:

1. Identify the authoritative source.
2. Identify cache key.
3. Identify TTL.
4. Define explicit invalidation events.
5. Define stale-data risk.
6. Test invalidation.

Never add caching without an invalidation strategy for worker availability/publication.

---

# 21. Queue / Background Job Protocol

Before introducing a job:

- Define producer.
- Define consumer.
- Define payload.
- Define retry policy.
- Define idempotency.
- Define dead/failure handling.
- Define observability.

A failed background notification must not undo a successfully persisted lead.

---

# 22. External Integration Protocol

Before integrating a vendor:

1. Confirm the vendor/API is authorized.
2. Confirm official documentation.
3. Define adapter interface.
4. Define timeout.
5. Define retry.
6. Define failure behavior.
7. Define data shared with vendor.
8. Define secrets handling.
9. Define test strategy.

Never couple domain logic directly to a vendor SDK.

---

# 23. Performance Review Protocol

For public-route changes, inspect:

- Client JavaScript added.
- Number of network calls.
- Server latency.
- Image weight.
- Query count.
- Third-party scripts.
- Cache opportunities.
- Hydration requirements.

Do not optimize blindly.

Measure meaningful bottlenecks.

---

# 24. Accessibility Review Protocol

For interactive UI:

Verify:

```text
[ ] Correct semantic element.
[ ] Keyboard interaction.
[ ] Visible focus.
[ ] Accessible name.
[ ] Form label.
[ ] Error association.
[ ] Touch target.
[ ] Color is not sole signal.
[ ] Reduced-motion behavior when relevant.
```

---

# 25. Agent Self-Review Before Completion

Before finalizing substantial work, the agent must conduct a self-review.

Ask:

### Product

- Did I solve the stated problem?
- Did I accidentally expand scope?
- Is this still aligned with AHD?

### Architecture

- Is business logic in the right layer?
- Did I duplicate logic?
- Did I introduce unnecessary infrastructure?

### Data

- Are relationships normalized appropriately?
- Are historical records preserved?
- Are public/private fields separated?

### Security

- Can an unauthorized user bypass this?
- Did I expose sensitive information?
- Did I log anything sensitive?

### UX

- Is the primary action obvious?
- Did I add unnecessary steps?
- Does mobile still work?

### Performance

- Did I add avoidable client JS/network/database cost?

### Tests

- Did I test both success and failure?

### Documentation

- Do docs still match the implementation?

---

# 26. Completion Evidence

A substantial task should finish with concise evidence.

Recommended completion note:

```text
Implemented:
- ...

Validated:
- lint
- typecheck
- unit: X
- integration: Y
- E2E: Z

Acceptance:
- [x] ...
- [x] ...

Documentation updated:
- API.md
- SECURITY.md

Known non-blocking follow-up:
- ...
```

Do not claim completion without evidence.

---

# 27. Planning for Parallel Work

Parallel work is allowed only when contracts are stable.

Safe examples:

```text
Worker Card UI
+
Worker Admin UI
```

after Worker API/data contract is stable.

Unsafe example:

```text
One agent changing worker status model
+
another agent independently implementing reservation logic
```

when both depend on the same unsettled state machine.

Before parallel work:

```text
Freeze shared contract
→ assign ownership
→ define integration point
```

---

# 28. Ownership Rule

For each substantial change, identify one authoritative owner for each concern.

Example:

```text
Worker domain state → WorkersModule
Worker persistence → WorkerRepository
Public presentation → web
Admin editing → admin
Analytics event emission → analytics layer
```

Avoid circular ownership.

---

# 29. Scope Escalation Rule

If implementation uncovers a larger issue:

Do not silently expand.

Write:

```text
Discovered:
...

Impact:
...

Recommended action:
...

Current task can/cannot continue safely because:
...
```

Then update the plan.

---

# 30. Large Refactor Rule

A refactor must preserve observable behavior unless behavior change is explicitly included.

Required:

- Baseline tests before refactor.
- Clear target architecture.
- Small migration steps.
- No simultaneous unrelated product changes.
- Regression tests after each major step.

---

# 31. Production Migration Rule

For risky production changes:

```text
Backward-compatible DB change
→ deploy compatible app
→ migrate/backfill
→ verify
→ remove old path later
```

Prefer expand-and-contract migration patterns.

Avoid deployments that require perfect simultaneous cutover unless unavoidable.

---

# 32. Rollback Decision Rule

Before production rollout, classify rollback:

```text
TRIVIAL
SAFE WITH PROCEDURE
FORWARD-FIX PREFERRED
DATA-LOSS RISK
```

The plan must explain why.

---

# 33. Observability Rule

For operationally important behavior, define how failure will be detected.

Examples:

```text
WhatsApp handoff:
- API error rate
- WhatsApp URL construction success
- click-through event count

Worker publication:
- publish error rate
- cache invalidation failures
```

If production failure cannot be observed, the implementation is incomplete.

---

# 34. The Minimal-Attempt Strategy

To minimize retries, use this order:

```text
Understand deeply
→ change narrowly
→ verify immediately
```

Avoid:

```text
Guess
→ edit widely
→ run everything
→ discover many failures
→ guess again
```

The agent should prefer one well-supported hypothesis over five speculative edits.

---

# 35. Default Agent Workflow

For a normal substantial task, the default workflow is:

```text
1. Read relevant docs.
2. Inspect current implementation.
3. Write problem statement.
4. Lock scope.
5. List dependencies.
6. Define acceptance criteria.
7. Identify risks.
8. Define ordered steps.
9. Establish baseline tests.
10. Implement lowest-level contract.
11. Run focused validation.
12. Implement next layer.
13. Run focused validation.
14. Integrate real flow.
15. Test failures.
16. Run regression checks.
17. Update documentation.
18. Run final acceptance gate.
19. Report evidence.
```

---

# 36. Master Planning Template

Use the following template when creating a plan.

```markdown
# <Plan Title>

## Status
PLANNED | IN_PROGRESS | BLOCKED | COMPLETE

## Problem
...

## Expected Outcome
...

## Business/User Impact
...

## Current Behavior
...

## Desired Behavior
...

## Scope

### Included
- ...

### Excluded
- ...

## Dependencies

| Dependency | Status | Notes |
|---|---|---|
| ... | READY | ... |

## Risk Level
LOW | MEDIUM | HIGH

## Affected Modules
- ...

## Source of Truth
- ...

## Data Model Changes
...

## API Changes
...

## Domain Rules
...

## Permissions
...

## UX Changes
...

## Analytics
...

## Security Impact
...

## Scalability Impact
...

## Failure Modes
- ...

## Implementation Steps
1. ...
2. ...
3. ...

## Test Plan

### Unit
- ...

### Integration
- ...

### E2E
- ...

### Security
- ...

### Accessibility
- ...

### Performance
- ...

### Concurrency
- ...

## Rollout
...

## Rollback
...

## Acceptance Criteria
- [ ] ...
- [ ] ...

## Completion Evidence
To be filled after implementation.
```

---

# 37. Project-Level Execution Relationship

Use the documents as follows:

```text
PRODUCT.md
    ↓
What are we building?

ARCHITECTURE.md
    ↓
How is the system structured?

EXECUTION_PLAN.md
    ↓
In what order are we building AHD?

PLANS.md
    ↓
How must each substantial piece of work be planned and executed?

AGENTS.md
    ↓
What behavioral rules must the coding agent follow?
```

---

# 38. Final Rule

For substantial work, the agent must never optimize for:

> **the fastest first edit**

It must optimize for:

> **the shortest path to a verified correct result.**

The preferred cycle is always:

```text
Read
→ Understand
→ Confirm
→ Plan
→ Implement Small
→ Verify
→ Integrate
→ Re-Verify
→ Document
→ Close
```

This protocol exists specifically to reduce rework, speculative debugging, hidden regressions, and repeated failed implementation attempts.


---

# Current MVP Simplification Guardrail

The approved MVP is:

```text
Admin CRUD
→ Public Catalogue / Paid Matching LP
→ Small Form
→ WhatsApp
```

Do not introduce custom CRM/request persistence, lead assignment, status history, follow-up scheduling, Redis/BullMQ for request handling, or backend public-form persistence unless a newer approved requirement explicitly requires it.

If such a change is requested later, treat it as a HIGH-risk architecture/scope change and plan it explicitly.

Current WhatsApp-form verification cycle:

```text
Validate
→ Build safe structured message
→ Verify configured destination
→ Track non-PII conversion
→ Open WhatsApp
```
