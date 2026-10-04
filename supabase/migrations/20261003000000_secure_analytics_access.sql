begin;

-- Definitions inspected in the production catalog export on 2026-10-03.
-- ALTER preserves each query, its columns, owner, and dependencies. Deliberately
-- fail if a view is missing; these views were created outside migration history.
alter view public.analytics_event_counts set (security_invoker = true);
alter view public.analytics_checkout_funnel set (security_invoker = true);
alter view public.analytics_daily_events set (security_invoker = true);

-- PUBLIC grants also apply to both browser roles.
revoke select on public.analytics_event_counts,
  public.analytics_checkout_funnel, public.analytics_daily_events
from public, anon, authenticated;

revoke select, update, delete, truncate on public.analytics_events
from public, anon, authenticated;

-- Table-level REVOKE does not remove independently granted column privileges.
do $$
declare
  target record;
  columns_sql text;
begin
  for target in
    select c.oid, c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in (
      'analytics_events', 'analytics_event_counts',
      'analytics_checkout_funnel', 'analytics_daily_events'
    )
  loop
    select string_agg(quote_ident(attname), ', ' order by attnum)
      into columns_sql
    from pg_attribute
    where attrelid = target.oid and attnum > 0 and not attisdropped;
    execute format('revoke select (%s) on public.%I from public, anon, authenticated',
      columns_sql, target.relname);
    if target.relname = 'analytics_events' then
      execute format('revoke update (%s) on public.%I from public, anon, authenticated',
        columns_sql, target.relname);
    end if;
  end loop;
end $$;

alter table public.analytics_events enable row level security;
grant insert on public.analytics_events to anon;
drop policy if exists "Allow anonymous event inserts" on public.analytics_events;
create policy "Allow anonymous event inserts"
on public.analytics_events for insert to anon with check (true);

-- Fail atomically if inherited grants/ownership still permit browser access.
do $$
declare
  browser_role text;
  relation_name text;
begin
  foreach browser_role in array array['anon', 'authenticated'] loop
    foreach relation_name in array array[
      'public.analytics_events', 'public.analytics_event_counts',
      'public.analytics_checkout_funnel', 'public.analytics_daily_events'
    ] loop
      if has_table_privilege(browser_role, relation_name, 'SELECT')
         or has_any_column_privilege(browser_role, relation_name, 'SELECT') then
        raise exception '% still has read access to %', browser_role, relation_name;
      end if;
    end loop;
    if has_table_privilege(browser_role, 'public.analytics_events', 'UPDATE,DELETE,TRUNCATE')
       or has_any_column_privilege(browser_role, 'public.analytics_events', 'UPDATE') then
      raise exception '% still has mutation access to analytics_events', browser_role;
    end if;
  end loop;
end $$;

commit;
