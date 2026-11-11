# QELVION AI Workforce — Delivery Plan

## Product outcome

QELVION is an AI Workforce Platform: a secure company workspace where people and AI agents work together. Arasko is the orchestration layer. Agents may research, draft, analyse, organise and update internal records within explicit tenant permissions. External or consequential actions remain approval-gated.

## Verified baseline (2026-11-11)

The development branch `feat/agent-foundation` currently contains:
- Next.js 16 application with Clerk authentication and tenant context.
- Supabase-backed workspace records, agent runs, activity logs, AI usage, organisations, memberships and subscription records.
- Seven agent roles: CEO, Research, Sales, Developer, Marketing, Finance and Support.
- CEO orchestration that delegates to up to three specialists and stores run history.
- Arasko company-context chat, approval queue, workspace APIs, Stripe billing routes/webhook, analytics and command-centre screens.
- Vercel Preview deployments are connected to the feature branch.

Database inspection found RLS enabled on the listed public tables. Supabase Security Advisors returned no findings at the time of inspection. Performance Advisors returned informational unused-index notices only. This is not a full penetration test or proof that every policy is correct.

## Delivery tracks

### 1. Foundation and tenant security
- [x] Clerk-backed tenant context is used by core AI and workspace routes.
- [x] Company-scoped queries and records exist for workspace, agent runs, activity and AI usage.
- [x] Admin-only approval decisions are enforced for organisation members.
- [ ] Verify every API route, storage bucket, webhook and background job against cross-tenant access tests.
- [ ] Add automated tests for tenant isolation, role permissions, unauthenticated requests and malformed input.
- [ ] Confirm Clerk organisation membership synchronisation and owner/admin lifecycle.

### 2. Arasko orchestration
- [x] Arasko has a company-scoped workspace snapshot.
- [x] CEO agent delegates selected work to specialist agents.
- [ ] Add structured task plans and machine-readable outputs with schema validation.
- [ ] Add durable queued/running/retrying/failed job lifecycle and idempotency.
- [ ] Add per-company budgets, rate limits, cancellation and timeout handling.
- [ ] Add observability for latency, token usage, cost and failure rates.

### 3. AI Workforce departments
- [x] CEO, Research, Sales, Developer, Marketing, Finance and Support agent roles exist.
- [ ] Add Operations and HR after a database migration updates the agent-role constraint.
- [ ] Define explicit tools and least-privilege permissions per role.
- [ ] Add agent-to-agent handoff contracts and human escalation.
- [ ] Add reusable department workflows and approval policies.

### 4. Real integrations and execution
- [x] Stripe billing endpoints and webhook foundation exist.
- [ ] Validate Stripe test-mode checkout, subscription lifecycle, cancellation and webhook replay.
- [ ] Add provider integrations only after credentials and scopes are configured by the owner.
- [ ] Start with read-only CRM/email/calendar connectors, then draft actions.
- [ ] Keep sending messages, publishing, payments, deletion, hiring decisions and code deployment behind explicit approval.
- [ ] Persist external-action receipts and audit trails.

### 5. Company intelligence
- [x] Dashboard, analytics and command centre screens exist.
- [ ] Calculate time saved and cost avoided from measured activity, not model estimates.
- [ ] Add team/agent performance, SLA, quality and exception dashboards.
- [ ] Label missing or estimated data clearly.

### 6. Commercial readiness
- [x] Subscription data model and Stripe integration foundation exist.
- [ ] Verify prices, taxes, billing portal, plan entitlements and usage limits in Stripe test mode.
- [ ] Add onboarding, workspace setup, data export/deletion and support flows.
- [ ] Complete privacy notice, terms, DPA, retention policy and security documentation before customer launch.
- [ ] Run a pilot with a small number of consenting companies.

### 7. Release quality
- [x] Feature branch has Vercel Preview deployment integration.
- [x] Add GitHub Actions static quality checks for lint and TypeScript type checking.\n- [ ] Add build, unit/integration tests and dependency/security review.
- [ ] Run end-to-end tests against an isolated staging database and test credentials.
- [ ] Complete accessibility, mobile and performance reviews.
- [ ] Require explicit owner approval before merging to main or promoting to Production.

## Non-negotiable execution policy

1. Tenant data must never be mixed across organisations.
2. Secrets stay server-side; never expose service-role keys or provider tokens to the browser.
3. AI outputs and retrieved documents are untrusted input, not instructions.
4. Agents may autonomously perform reversible internal work within granted permissions.
5. External communications, money movement, legal commitments, employment decisions, destructive actions and production releases require human approval.
6. Every consequential action must have an actor, tenant, timestamp, input, outcome and audit record.
7. Never claim an action completed unless the connected provider confirms success.

## Release definition

QELVION is ready for a controlled pilot only when tenant-isolation tests, role checks, billing test flows, approval-gated actions, audit logging, failure recovery and end-to-end workflows pass in an isolated staging environment. A successful Next.js build alone is not production readiness.


## Documentation delivered

- [x] Swedish customer-facing product guide: `docs/PRODUCT-GUIDE-SV.md`.
- [x] Link product guide from the repository README.
