-- 접속해 있으면 내가 속한 모든 마을에서 온라인: 한 마을에 있어도 다른 마을의 내 자리가 오프라인으로 바뀌지 않는다.
create or replace function public.heartbeat(p_village uuid) returns timestamptz
language sql security definer set search_path = '' as $$
  update public.research_status set last_seen_at = now(), left_at = null
  where user_id = (select auth.uid());
  select now();
$$;

-- 탭을 닫으면 모든 마을에서 곧바로 오프라인으로 보인다
create or replace function public.go_away(p_village uuid) returns void
language sql security definer set search_path = '' as $$
  update public.research_status set left_at = now()
  where user_id = (select auth.uid());
$$;

-- 마을에 들어올 때: 오래 자리를 비웠던 마을마다 '집중 연구' 같은 상태를 '휴식'으로 되돌리고, 모든 마을에서 접속 중으로 한다.
create or replace function public.enter_village(p_village uuid) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := public.require_user();
  v_last timestamptz;
begin
  select last_seen_at into v_last from public.research_status
    where village_id = p_village and user_id = v_uid for update;
  if v_last is null then
    raise exception 'not_member';
  end if;
  update public.research_status set status = 'rest'
    where user_id = v_uid and status <> 'offline' and last_seen_at < now() - interval '150 seconds';
  update public.research_status set last_seen_at = now(), left_at = null
    where user_id = v_uid;
  return now();
end;
$$;
