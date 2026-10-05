// Run against an isolated PostgreSQL WASM engine, never the linked live project.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const db = new PGlite();
let checks = 0;
async function sql(query, args) { return (await db.query(query, args)).rows; }
async function denied(query) {
  await assert.rejects(() => sql(query), e => e.code === '42501');
  checks++;
}
await db.exec(`create role anon; create role authenticated;
  grant usage on schema public to anon, authenticated;
  create table public.countdowns(id integer primary key, gender text);
  insert into public.countdowns values (1, 'girl');
  grant all on public.countdowns to public, anon, authenticated;
  grant select(gender), update(gender) on public.countdowns to anon;
  alter table public.countdowns enable row level security;
  create policy legacy_open on public.countdowns for all using(true) with check(true);`);
await db.exec(await readFile(new URL('../migrations/20261004000000_create_reveals.sql', import.meta.url), 'utf8'));
// Reproduce the original leak independently of React.
await db.exec(`insert into public.reveals values ('ABC234','girl',1,false,'https://example.com/girl.gif',now()); set role anon;`);
assert.equal((await sql('select gender from public.reveals'))[0].gender, 'girl'); checks++;
await db.exec('reset role');
await db.exec(await readFile(new URL('../migrations/20261004010000_secure_reveals.sql', import.meta.url), 'utf8'));
for (const role of ['anon', 'authenticated']) {
  await db.exec(`set role ${role}`);
  for (const table of ['reveals', 'countdowns', 'reveal_sessions']) {
    await denied(`select * from public.${table}`);
    await denied(`delete from public.${table}`);
  }
  await denied(`select gender from public.reveals where id='ABC234'`);
  await denied(`select gender from public.countdowns`);
  await denied(`update public.reveals set gender='boy' where id='ABC234'`);
  await denied(`update public.countdowns set gender='boy' where id=1`);
  await denied(`insert into public.reveals(id,gender,duration_seconds) values ('hijack','boy',1)`);
  await denied(`insert into public.countdowns values (2,'boy')`);
  await denied(`insert into public.reveal_sessions(reveal_id,ready_at,expires_at) values ('ABC234',now(),now())`);
  await denied(`update public.reveal_sessions set ready_at=now()`);
  await assert.rejects(() => sql(`select public.create_reveal('girl',0,false,'')`)); checks++;
  await assert.rejects(() => sql(`select public.create_reveal(null,1,false,'')`)); checks++;
  await assert.rejects(() => sql(`select public.start_reveal('unknown')`)); checks++;
  const [{ token }] = await sql(`select public.create_reveal('girl',1,true,'https://example.com/girl.gif') token`);
  assert.match(token, /^[0-9a-f-]{36}$/); checks++;
  const [{ session }] = await sql('select public.start_reveal($1) session', [token]);
  assert.deepEqual(Object.keys(session).sort(), ['duration_seconds', 'ticket']); checks++;
  assert.equal((await sql('select public.finish_reveal($1) result', [session.ticket]))[0].result, null); checks++;
  assert.equal((await sql("select public.finish_reveal('00000000-0000-0000-0000-000000000000') result"))[0].result, null); checks++;
  await new Promise(resolve => setTimeout(resolve, 1100));
  assert.deepEqual((await sql('select public.finish_reveal($1) result', [session.ticket]))[0].result,
    { gender: 'girl', fireworks: true, custom_gif_url: 'https://example.com/girl.gif' }); checks++;
  // A fresh visitor still waits even after another visitor has finished.
  const [{ session: second }] = await sql('select public.start_reveal($1) session', [token]);
  assert.notEqual(second.ticket, session.ticket); checks++;
  assert.equal((await sql('select public.finish_reveal($1) result', [second.ticket]))[0].result, null); checks++;
  await db.exec('reset role');
  await sql("update public.reveal_sessions set expires_at=now()-interval '1 second' where id=$1", [session.ticket]);
  await db.exec(`set role ${role}`);
  assert.equal((await sql('select public.finish_reveal($1) result', [session.ticket]))[0].result, null); checks++;
  await db.exec('reset role');
}
assert.equal((await sql('select count(*)::int n from public.countdowns'))[0].n, 1); checks++;
assert.equal((await sql("select gender from public.reveals where id='ABC234'"))[0].gender, 'girl'); checks++;
await db.exec(await readFile(new URL('../verification/reveal_permissions.sql', import.meta.url), 'utf8'));
await db.close();
console.log(`${checks} database permission assertions passed (anon + authenticated).`);
