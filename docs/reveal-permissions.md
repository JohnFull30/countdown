# Reveal and countdown permission audit

## Scope and evidence

Started from the clean local `main` checkout on `codex/secure-reveals`.
No remote fetch, live database inspection, migration, or deployment was performed.
`sources/` and Stripe were not changed. The frontend uses a public Supabase key;
that key is not an authorization boundary. `.supabase/config.toml` contains only a project reference; it does not establish
database permissions. No local Supabase server configuration is checked in.

The original `20261004000000_create_reveals.sql` granted SELECT to both browser
roles with `USING (true)`. A direct `SELECT gender FROM public.reveals` as `anon`
returned the saved secret in the local reproduction. Filtering by ID in React
never prevented a caller from omitting the filter. `GenderCountdown.js` previously
loaded gender and custom media before Start, exposing them in network responses
and React state even when the screen was neutral. Six-character Math.random IDs
were also too weak for long-lived bearer links.

Original reveal INSERT was allowed with a six-character ID; UPDATE was granted
but there was no UPDATE policy, so the checked-in RLS denied overwrite. DELETE
was revoked. Actual live rules could differ. `countdowns` had a best-effort INSERT
of gender/media but no checked-in schema or policies; its prior live list, update,
and delete behavior cannot be determined from this repository.

## Intended permission contract

There is no Supabase Auth login, creator ID, account library, edit, or delete flow.
The creator already knows the secret because they enter it. Adding an ownership
claim supplied by the client would not establish identity.

| Actor | Create | Read | Update / delete |
| --- | --- | --- | --- |
| Anonymous or signed-in creator | Validated `create_reveal` RPC; returns a random UUID link | Same bearer-link flow as guests | Denied |
| Guest with link | Can create an unrelated reveal | Start a private session; read gender/media only after the server delay | Denied |
| Visitor without link | Can create their own reveal | Cannot list records or read another reveal/session | Denied |
| Browser accessing `countdowns` | Denied; unused logging removed | Denied | Denied |
| Trusted database operator | Administrative access | Administrative access | Administrative access |

The migration removes existing policies and table AND column grants from PUBLIC,
anon, and authenticated for reveals/countdowns, enables RLS, and provides no
browser policies. This also removes unknown permissive policies on these tables.
It preserves all records. `countdowns` is optional: a missing table is skipped.
The session table has no browser grants/policies. RPCs use an empty search path,
qualified table names, explicit EXECUTE grants, and server-generated tokens.
This follows [Supabase's database function guidance](https://supabase.com/docs/guides/database/functions).

## Time and sharing semantics

The current product has a duration (1–30 seconds), not a scheduled event time or
host-authorized release. A link holder can start early through the API and learn
the secret after waiting that duration. It is impossible to distinguish that
request from an intended guest click. This change enforces the existing per-guest
countdown contract, not an embargo until a party starts.

`start_reveal` creates an independent random ticket and records ready/expiry times
using the database clock. Its response contains ONLY ticket and duration.
`finish_reveal` returns null before readiness, for unknown tickets, or after one
hour; only a ready ticket returns gender, fireworks, and media. Changing the
browser clock, URL duration/gender/media, or calling finish early cannot release
the database secret. One visitor finishing does not unlock another visitor's
session. A ready ticket may be replayed until expiry. Links and tickets are bearer
capabilities: recipients can share them and can share what they learn.

New secret links omit gender and custom media and use random UUIDs (122 random
bits). Existing six-character links still work, retaining their guessing risk.
Reissue sensitive old links via setup and, after checking references, remove old
records administratively if needed. Previously downloaded/cached secrets cannot
be revoked. Non-secret URLs intentionally remain public. The creator's own
create request necessarily contains the entered secret.

For a strict synchronized event, first add a creator-controlled `reveal_at` or
host release with authenticated ownership, then require that condition inside
`finish_reveal`. Do not rely on a client timer or a client-supplied release date.

## Local verification

Verified locally: **53 database assertions passed**, **11 frontend tests passed
across 3 suites**, and the production build compiled successfully. `git diff
--check` also passed. The test runner emitted only an existing Node punycode
deprecation warning. No live database settings or HTTP behavior were verified.

Run frontend tests and the build:

```sh
CI=true npm test -- --watchAll=false --runInBand --watchman=false
npm run build
```

Run executable SQL permission tests without using project credentials:

```sh
npm install --prefix /tmp/countdown-permission-tests --no-audit --no-fund @electric-sql/pglite@0.3.14
PGLITE_MODULE=/tmp/countdown-permission-tests/node_modules/@electric-sql/pglite/dist/index.js node supabase/tests/reveal-permissions.mjs
```

This executes the original and new migrations in isolated PostgreSQL WASM
(PGlite), with real role/grant/RLS enforcement, not mocked SQL. Its countdowns
fixture deliberately starts with public grants, a permissive policy, and column
grants. It checks both browser roles, direct list/read/insert/update/delete,
session tampering, malformed creation, unknown links/tickets, early retrieval,
real elapsed-time release, independent sessions, expiry, and preservation of
existing records. Frontend tests mock the RPC transport; they do not prove live
PostgREST, grants, cache behavior, or production schema equivalence.

## Outstanding live inspection and deployment (manual only)

1. In the intended Supabase project, run
   `supabase/verification/reveal_permissions.sql` in SQL Editor and save results.
   Inspect the actual reveals/countdowns columns, constraints, grants, policies,
   triggers, role memberships, exposed schemas, views/materialized views, RPCs,
   and Realtime publications. In Project Settings → Data API, confirm the exposed
   schemas. Resolve any other callable function or view that can return these
   secrets; this migration cannot secure an unknown alternate endpoint. Confirm
   anon/authenticated are not privileged roles or members of privileged roles.
2. Compare live `reveals` to the checked-in base schema. Apply
   `20261004000000_create_reveals.sql` ONLY if the table is absent. If it already
   exists, reconcile schema differences first; do not recreate or drop its data.
   Review existing checks/triggers (for example a six-character-only ID check
   would reject new UUIDs). Back up relevant schema/data. Review any other clients
   that use countdown logging or direct reveal queries; those calls will fail.
3. Apply ONLY `supabase/migrations/20261004010000_secure_reveals.sql` in the target
   SQL Editor as a trusted migration owner. It is transactional and intended to
   run once. Do not blindly push all pending migrations or invoke Stripe scripts.
   Record this migration in your established migration history workflow.
4. Rerun the read-only inventory. All effective browser table and column
   privileges for these tables must be false, with no policies. Only the three
   new reveal RPCs should expose this flow, owned by a trusted role, with
   `search_path=""`. Investigate any remaining true grants (including inherited
   grants) and any alternate functions/views before considering the live audit
   complete. Remove these tables from Realtime publications if unused, and check
   for old subscriptions, Edge Functions, and custom API caches serving secrets.
5. Test with the public key and separately a normal signed-in user's JWT, never
   a service-role key. Using curl or an API client against `/rest/v1`:
   - GET `/reveals?select=*`, `/reveals?select=gender&id=eq.<known-id>`,
     `/countdowns?select=*`, and `/reveal_sessions?select=*` must be denied.
   - PATCH and DELETE a disposable known record; POST directly to each table.
     Each must be denied, with unchanged data confirmed as operator.
   - POST `/rpc/create_reveal` with
     `{"p_gender":"girl","p_duration":3,"p_fireworks":false,"p_media":"https://example.com/girl.gif"}`.
     Save the returned token. POST `/rpc/start_reveal` with
     `{"p_reveal_id":"<token>"}`; inspect its entire response for ONLY ticket/duration.
     POST `/rpc/finish_reveal` with `{"p_ticket":"<ticket>"}` immediately: expect
     null. Repeat after three seconds: expect the saved settings. Repeat with an
     unknown ticket and start a second session to verify independent waiting.
     Supply `apikey: <public-key>`, `Authorization: Bearer <public-key-or-user-JWT>`
     and `Content-Type: application/json`. Use disposable fixtures; these tests
     intentionally create records and are not read-only.
6. Merge/review the branch and deploy the matching frontend immediately after
   the database migration (old clients fail closed once table access is revoked).
   Confirm a clean working tree on main with ONLY reviewed changes before using
   `bash scripts/choose-script.sh`, option **1**. Its `deploy.sh` checks out main,
   pulls, stages **everything**, commits, pushes main, and deploys gh-pages.
   It does not deploy database rules. Avoid that option with unrelated/unreviewed
   changes. Alternatively use the established reviewed release process and
   `npm run deploy` from the approved checkout. No deployment was run here.
7. In a fresh browser, verify new and legacy links, ordinary countdowns, custom
   media, fireworks, failures/retries, and two simultaneous guests. Inspect Network
   response bodies before and after Start and readiness; confirm no gender/media
   response or gender-specific media request before release. Check old deployed
   mobile builds too; rebuild them for the RPC contract. Do not restore broad
   SELECT grants as a rollback; fix forward or temporarily disable secret mode.

Anonymous creation/session start still permit spam/storage growth, as anonymous
creation did before. Add gateway rate limits/CAPTCHA if needed for abuse control;
SQL delay is a confidentiality control, not a rate limiter. Configure a trusted
scheduled cleanup (for example hourly `delete from public.reveal_sessions where
expires_at < now();`) after reviewing your project's scheduler. No job was created.
Monitor table size and RPC errors during rollout.

## User-applied migration follow-up

After the initial audit, the user manually ran the security migration in the
production project's SQL Editor and shared its successful result. The user then
confirmed the missing `create_reveal` error was resolved. This confirms the
reported save flow now works; the full live permissions inventory and API tests
above remain outstanding. The agent did not apply the live migration or deploy
the frontend. Do not rerun this one-time migration on that project.
