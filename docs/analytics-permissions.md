# Analytics permissions

## Audit

The production catalog export supplied on 2026-10-03 confirmed all three public
views exist with null `reloptions`:

- `analytics_event_counts`: counts per event, ordered by descending count.
- `analytics_daily_events`: counts per day and event, ordered by descending day
  and then event name.
- `analytics_checkout_funnel`: counts paywall views, checkout starts, payment
  successes, cancellations and failures; rounds success/start percentage to two
  places and uses NULLIF to avoid division by zero.

All three read `analytics_events`. The migration uses only ALTER VIEW to preserve
their definitions, columns, owners and dependencies. PostgreSQL documents the
[security_invoker setting](https://www.postgresql.org/docs/18/sql-alterview.html).

`src/analytics.js` inserts events without requesting returned rows. No frontend
caller reads these views. `src/supabaseClient.js` uses the anonymous key; no
frontend or key configuration changes are needed.

## Apply and verify

Apply `supabase/migrations/20261003000000_secure_analytics_access.sql` through the
normal database migration process. Then run the statements in
`supabase/verification/analytics_permissions.sql` as postgres. In the dashboard,
run each query separately to see every result. The final transaction tests a real
anonymous insert and rolls it back. Rerun Advisor after applying the migration.

The migration revokes view SELECT and event-table SELECT/UPDATE/DELETE/TRUNCATE
from PUBLIC, anon and authenticated, including independent column SELECT/UPDATE
grants. It retains RLS and the permissive anonymous insert policy, explicitly
grants anonymous INSERT, and leaves other policies and authenticated INSERT
unchanged. It aborts if inherited privileges still allow forbidden operations;
investigate those role memberships instead of broadening this migration's scope.

## Limits and remaining risks

- This change has not been applied to production. Live grants and the full policy
  list were not included in the supplied export. Run verification to confirm
  ingestion, including any restrictive INSERT policies or triggers.
- Anonymous ingestion remains open to fabricated events and spam, as before.
- Invoker views require the querying administrative role to have access to the
  underlying table. Test any external reporting integrations after deployment.
- The views were created outside checked-in migration history. A fresh database
  must have those existing definitions restored before this migration; missing
  views deliberately cause failure rather than being silently skipped.
- Future grants or privileged SECURITY DEFINER functions could separately expose
  analytics. This migration covers the named relations and browser roles.
- The project test command is blocked by the pre-existing double comma on line 8
  of the locally modified package.json. The local PostgreSQL client installation
  lacks the postgres server executable, so database execution tests could not run.
