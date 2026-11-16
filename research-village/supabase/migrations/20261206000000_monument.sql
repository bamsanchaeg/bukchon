-- 마을의 비석 이벤트: 정해진 한 사람(target_user)만 누를 수 있고, 누르면 먼지로 사라진다. 다른 사람이 눌러도 아무 일도 없다.
create table public.monuments (
  village_id uuid primary key references public.villages (id) on delete cascade,
  target_user uuid not null references auth.users (id) on delete cascade,
  wish_id uuid references public.wishes (id) on delete set null,
  broken_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.monuments enable row level security;
revoke all on public.monuments from anon, authenticated, public;
grant select on public.monuments to authenticated;
create policy monuments_select on public.monuments for select to authenticated using (public.is_village_member(village_id));
alter publication supabase_realtime add table public.monuments;

-- 비석을 부순다 (대상자만). 연결된 소원이 있으면 이뤄진 것으로 바꾼다.
create function public.break_monument(p_village uuid) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := public.require_user(); v_at timestamptz; v_wish uuid;
begin
  update public.monuments set broken_at = now()
    where village_id = p_village and target_user = v_uid and broken_at is null
    returning broken_at, wish_id into v_at, v_wish;
  if v_at is null then raise exception 'not_allowed'; end if;
  if v_wish is not null then
    update public.wishes set status = 'done', reply = '문명원에서 탈출했어요!' where id = v_wish;
  end if;
  return v_at;
end;
$$;
revoke all on function public.break_monument(uuid) from public, anon;
grant execute on function public.break_monument(uuid) to authenticated;
