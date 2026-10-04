-- Supports the existing anonymous secret-link save/read flow.
-- Secret mode hides gender from the URL; this is not private storage:
-- the current frontend requires public read access to reveal records.
begin;

create table public.reveals (
  id text primary key,
  gender text not null check (gender in ('boy', 'girl')),
  duration_seconds integer not null check (duration_seconds between 1 and 30),
  fireworks boolean not null default false,
  custom_gif_url text not null default '',
  created_at timestamptz not null default now()
);

alter table public.reveals enable row level security;
revoke all on table public.reveals from anon, authenticated;
-- UPDATE privilege is required by the client's ON CONFLICT DO UPDATE statement.
-- No UPDATE policy is provided, so existing records cannot be overwritten.
grant select, insert, update on table public.reveals to anon, authenticated;

create policy reveals_insert on public.reveals
  for insert to anon, authenticated
  with check (id ~ '^[23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{6}$');

create policy reveals_read on public.reveals
  for select to anon, authenticated
  using (true);

notify pgrst, 'reload schema';
commit;
