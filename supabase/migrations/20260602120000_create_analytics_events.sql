create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  session_id text,
  route text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;

drop policy if exists "Allow anonymous event inserts" on public.analytics_events;

create policy "Allow anonymous event inserts"
on public.analytics_events
for insert
to anon
with check (true);
