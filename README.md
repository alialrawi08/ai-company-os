# AF QELVION

**QELVION is an AI Workforce Platform for modern companies.**

It brings company operations, projects, customer relationships, documents, analytics and AI teammates into one workspace. Arasko is the executive AI assistant and orchestration layer; specialist agents support research, sales, engineering, marketing, finance and customer support.

## Current platform foundation

- Next.js 16, React 19 and TypeScript
- Clerk authentication and organisation context
- Supabase workspace, agent-run, activity, AI-usage and billing data
- Arasko assistant and CEO-led specialist orchestration
- Approval queue for consequential actions
- Stripe billing foundation
- Vercel Preview deployments from `feat/agent-foundation`

## Product principle

QELVION is designed for people and AI agents to work together. Agents can analyse, research, prepare drafts and manage permitted internal workflows. External communications, financial transactions, legal commitments, employment decisions, destructive actions and Production releases require explicit human approval.

## Development

```bash
npm install
npm run dev
```

Required server-side integrations are configured through environment variables. Never expose Supabase service-role credentials, OpenAI keys, Stripe secrets or Clerk secret keys through `NEXT_PUBLIC_*` variables.

## Delivery plan

See [docs/AI-WORKFORCE-ROADMAP.md](docs/AI-WORKFORCE-ROADMAP.md) for the verified baseline, remaining delivery tracks, security rules and pilot release criteria.

## Branch and release policy

Active development is on `feat/agent-foundation`. Do not merge to `main` or promote to Production without explicit owner approval.
