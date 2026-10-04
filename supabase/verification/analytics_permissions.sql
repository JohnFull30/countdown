-- Run as postgres after applying 20261003000000_secure_analytics_access.sql.
-- All three views must have security_invoker=true; queries stay unchanged.
select c.relname, c.reloptions, pg_get_viewdef(c.oid, true) as definition
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'v'
  and c.relname in ('analytics_event_counts', 'analytics_checkout_funnel',
                   'analytics_daily_events')
order by c.relname;

-- Effective grants (includes PUBLIC and inherited privileges).
-- Every can_select value must be false. On analytics_events, can_update,
-- can_delete and can_truncate must also be false and anon can_insert=true.
-- Authenticated INSERT is intentionally unchanged.
select r.role_name, t.relation_name,
  has_table_privilege(r.role_name, t.relation_name, 'SELECT')
    or has_any_column_privilege(r.role_name, t.relation_name, 'SELECT') as can_select,
  has_table_privilege(r.role_name, t.relation_name, 'INSERT') as can_insert,
  has_table_privilege(r.role_name, t.relation_name, 'UPDATE')
    or has_any_column_privilege(r.role_name, t.relation_name, 'UPDATE') as can_update,
  has_table_privilege(r.role_name, t.relation_name, 'DELETE') as can_delete,
  has_table_privilege(r.role_name, t.relation_name, 'TRUNCATE') as can_truncate
from (values ('anon'), ('authenticated')) r(role_name)
cross join (values ('public.analytics_events'), ('public.analytics_event_counts'),
  ('public.analytics_checkout_funnel'), ('public.analytics_daily_events')) t(relation_name);

-- Explicit table and column ACLs, including PUBLIC grants.
select c.relname, c.relacl, a.attname, a.attacl
from pg_class c join pg_namespace n on n.oid = c.relnamespace
join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
where n.nspname = 'public' and c.relname in (
  'analytics_events', 'analytics_event_counts', 'analytics_checkout_funnel',
  'analytics_daily_events')
order by c.relname, a.attnum;

-- RLS must be enabled. Inspect every policy, including restrictive INSERT
-- policies that could prevent anonymous ingestion despite the permissive policy.
select relrowsecurity, relforcerowsecurity from pg_class
where oid = 'public.analytics_events'::regclass;
select policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' and tablename = 'analytics_events';

-- Real anonymous INSERT, without RETURNING (matches src/analytics.js).
-- Roll back the probe so it does not enter analytics aggregates.
begin;
set local role anon;
insert into public.analytics_events (event_name, session_id, route, metadata)
values ('permissions_verification', 'permissions_verification', '/', '{}'::jsonb);
rollback;
