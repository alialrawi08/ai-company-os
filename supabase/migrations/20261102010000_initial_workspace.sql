-- AI Company OS initial schema
-- Data is accessed through authenticated server routes using the Supabase service role.
-- Direct access from anon/authenticated roles is intentionally denied.

create extension if not exists pgcrypto;

create table if not exists public.workspace_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  section text not null check (section in ('projects','crm','documents','agents','settings')),
  title text not null,
  description text not null default '',
  content jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_items_owner_section_updated_idx
  on public.workspace_items (user_id, section, updated_at desc);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  agent_role text not null check (agent_role in ('ceo','research','sales','developer','marketing','finance','support')),
  task text not null,
  result text,
  status text not null default 'completed' check (status in ('queued','running','completed','failed')),
  created_at timestamptz not null default now()
);

create index if not exists agent_runs_owner_created_idx
  on public.agent_runs (user_id, created_at desc);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  event_type text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_owner_created_idx
  on public.activity_logs (user_id, created_at desc);

alter table public.workspace_items enable row level security;
alter table public.agent_runs enable row level security;
alter table public.activity_logs enable row level security;

revoke all on public.workspace_items from anon, authenticated;
revoke all on public.agent_runs from anon, authenticated;
revoke all on public.activity_logs from anon, authenticated;

grant all on public.workspace_items to service_role;
grant all on public.agent_runs to service_role;
grant all on public.activity_logs to service_role;
