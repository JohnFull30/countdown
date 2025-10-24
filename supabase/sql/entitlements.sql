-- Run this in Supabase SQL editor

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  stripe_customer_id text,
  stripe_checkout_session_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entitlements_device_idx on public.entitlements (device_id);

-- RLS: allow read-only to anon (client needs to check entitlement)
alter table public.entitlements enable row level security;

create policy "Read entitlements by device_id"
on public.entitlements for select
to anon
using (true); -- we'll filter by device_id client-side; if you want stricter, use a PostgREST RPC.

-- Optional: Prevent inserts/updates from client
create policy "Server-only writes"
on public.entitlements for all
to anon
using (false)
with check (false);