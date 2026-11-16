-- 소원구슬: 주민이 마을 광장의 구슬에게 "이런 게 있으면 좋겠어요" 소원을 말한다. 처리 상태·답글은 서버(운영자)만 바꾼다.
create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  village_id uuid not null references public.villages (id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 300),
  status text not null default 'new' check (status in ('new', 'doing', 'done', 'declined')),
  reply text not null default '' check (char_length(reply) <= 200),
  created_at timestamptz not null default now()
);
create index wishes_village on public.wishes (village_id, created_at desc);
alter table public.wishes enable row level security;
revoke all on public.wishes from anon, authenticated, public;
-- 마을 주민은 마을의 소원 목록을 볼 수 있고, 내 소원을 쓰고(상태·답글은 못 정한다), 아직 대기 중인 내 소원은 지울 수 있다.
grant select, delete on public.wishes to authenticated;
grant insert (village_id, body) on public.wishes to authenticated;
create policy wishes_select on public.wishes for select to authenticated using (public.is_village_member(village_id));
create policy wishes_insert on public.wishes for insert to authenticated
  with check (author_id = (select auth.uid()) and public.is_village_member(village_id));
create policy wishes_delete on public.wishes for delete to authenticated
  using (author_id = (select auth.uid()) and status = 'new');

-- 하루(24시간)에 소원은 사람마다 3개까지
create function public.limit_wishes() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.wishes w where w.author_id = new.author_id and w.created_at > now() - interval '24 hours') >= 3 then
    raise exception 'too_many_wishes';
  end if;
  return new;
end $$;
revoke all on function public.limit_wishes() from public, anon, authenticated;
create trigger wishes_limit before insert on public.wishes for each row execute function public.limit_wishes();
