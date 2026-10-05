-- Read-only inventory: run in the target project's SQL Editor before and after
-- the migration. Save output for review; do not confuse it with local tests.
begin transaction read only;
select current_database(), current_user, version();
select n.nspname, c.relname, c.relrowsecurity, c.relforcerowsecurity,
       pg_get_userbyid(c.relowner) as owner
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('reveals','countdowns','reveal_sessions');
select table_name,column_name,data_type,is_nullable,column_default
from information_schema.columns
where table_schema='public' and table_name in ('reveals','countdowns','reveal_sessions');
select conrelid::regclass as relation,conname,pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in (to_regclass('public.reveals'),to_regclass('public.countdowns'),to_regclass('public.reveal_sessions'));
select * from pg_policies
where schemaname='public' and tablename in ('reveals','countdowns','reveal_sessions');
-- Every effective table/column privilege here should be false after migration.
select r.rolname, c.relname, p.privilege,
       has_table_privilege(r.oid,c.oid,p.privilege) as allowed
from pg_roles r cross join pg_class c cross join
  (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) p(privilege)
where r.rolname in ('anon','authenticated') and c.relnamespace='public'::regnamespace
  and c.relname in ('reveals','countdowns','reveal_sessions');
select r.rolname, c.relname, a.attname, p.privilege,
       has_column_privilege(r.oid,c.oid,a.attnum,p.privilege) as allowed
from pg_roles r cross join pg_class c join pg_attribute a on a.attrelid=c.oid
cross join (values ('SELECT'),('INSERT'),('UPDATE'),('REFERENCES')) p(privilege)
where r.rolname in ('anon','authenticated') and c.relnamespace='public'::regnamespace
  and c.relname in ('reveals','countdowns','reveal_sessions') and a.attnum>0 and not a.attisdropped;
-- Inspect ALL exposed views and callable functions for alternate data paths.
select schemaname, viewname, definition from pg_views
where schemaname not in ('pg_catalog','information_schema');
select schemaname, matviewname, definition from pg_matviews
where schemaname not in ('pg_catalog','information_schema');
select n.nspname, p.oid::regprocedure as function, p.prosecdef, p.proconfig,
  pg_get_userbyid(p.proowner) as owner,
  has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
  has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,
  pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname not in ('pg_catalog','information_schema') and p.prokind='f';
select event_object_schema,event_object_table,trigger_name,action_statement
from information_schema.triggers
where event_object_table in ('reveals','countdowns','reveal_sessions');
select * from pg_publication_tables
where tablename in ('reveals','countdowns','reveal_sessions');
select rolname,rolsuper,rolbypassrls,rolinherit from pg_roles
where rolname in ('anon','authenticated');
select member::regrole,roleid::regrole from pg_auth_members
where member in ('anon'::regrole,'authenticated'::regrole);
rollback;
