begin;

-- No browser role gets direct access, even if a legacy policy allowed it.
-- Remove column grants too: table-level REVOKE does not remove those.
do $$
declare t text; c record; p record;
begin
  foreach t in array array['reveals', 'countdowns'] loop
    if to_regclass('public.' || t) is null then continue; end if;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
    for c in select attname from pg_attribute where attrelid = to_regclass('public.' || t) and attnum > 0 and not attisdropped loop
      execute format('revoke all (%I) on public.%I from public, anon, authenticated', c.attname, t);
    end loop;
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
  end loop;
end $$;

create table public.reveal_sessions (
  id uuid primary key default gen_random_uuid(),
  reveal_id text not null references public.reveals(id) on delete cascade,
  ready_at timestamptz not null,
  expires_at timestamptz not null
);
alter table public.reveal_sessions enable row level security;
revoke all on public.reveal_sessions from public, anon, authenticated;

-- Anonymous creation is intentional. There is no account/creator edit flow.
create function public.create_reveal(p_gender text, p_duration integer,
  p_fireworks boolean, p_media text) returns text
language plpgsql security definer set search_path = '' as $$
declare token text := gen_random_uuid()::text;
begin
  if p_gender is null or p_gender not in ('boy', 'girl') or
     p_duration is null or p_duration not between 1 and 30 or
     p_fireworks is null or p_media is null or length(p_media) > 2048 then
    raise exception 'Invalid reveal settings' using errcode = '22023';
  end if;
  insert into public.reveals(id, gender, duration_seconds, fireworks, custom_gif_url)
    values(token, p_gender, p_duration, p_fireworks, p_media);
  return token;
end $$;

-- Each link holder starts an independent server-clock countdown. No secret
-- (including potentially gender-identifying media) is returned here.
create function public.start_reveal(p_reveal_id text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare seconds integer; ticket uuid; ready timestamptz;
begin
  select duration_seconds into seconds from public.reveals where id = p_reveal_id;
  if not found then raise exception 'Reveal unavailable' using errcode = '22023'; end if;
  ready := clock_timestamp() + make_interval(secs => seconds);
  insert into public.reveal_sessions(reveal_id, ready_at, expires_at)
    values(p_reveal_id, ready, ready + interval '1 hour') returning id into ticket;
  return jsonb_build_object('ticket', ticket, 'duration_seconds', seconds);
end $$;

create function public.finish_reveal(p_ticket uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  select jsonb_build_object('gender', r.gender, 'fireworks', r.fireworks,
    'custom_gif_url', r.custom_gif_url) into result
  from public.reveal_sessions s join public.reveals r on r.id = s.reveal_id
  where s.id = p_ticket and clock_timestamp() >= s.ready_at
    and clock_timestamp() < s.expires_at;
  return result; -- Same empty result for early, expired, and unknown tickets.
end $$;

revoke all on function public.create_reveal(text, integer, boolean, text) from public, anon, authenticated;
revoke all on function public.start_reveal(text) from public, anon, authenticated;
revoke all on function public.finish_reveal(uuid) from public, anon, authenticated;
grant execute on function public.create_reveal(text, integer, boolean, text) to anon, authenticated;
grant execute on function public.start_reveal(text) to anon, authenticated;
grant execute on function public.finish_reveal(uuid) to anon, authenticated;
notify pgrst, 'reload schema';
commit;
