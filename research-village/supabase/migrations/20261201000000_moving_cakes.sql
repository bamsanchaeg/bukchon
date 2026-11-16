-- 이사 떡 돌리기: 마을마다 한 번, 이웃 모두의 책상에 떡 접시를 올려 두고 알림을 보낸다. 받은 이웃은 "잘 먹을게요"로 답할 수 있다.
alter table public.gifts drop constraint gifts_kind_check;
alter table public.gifts add constraint gifts_kind_check check (kind in ('coffee', 'americano', 'snack', 'tea', 'beer', 'siru', 'rainbow', 'songpyeon'));
alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in (
  'postit', 'comment', 'chat_request', 'meeting',
  'gesture', 'gift', 'book_tip', 'journal_reaction', 'journal_comment', 'cheer', 'nudge',
  'moving_cake', 'moving_thanks'));

create table public.moving_cakes (
  village_id uuid not null references public.villages (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('siru', 'rainbow', 'songpyeon')),
  created_at timestamptz not null default now(),
  primary key (village_id, user_id)
);
alter table public.moving_cakes enable row level security;
revoke all on public.moving_cakes from anon, authenticated, public;
grant select on public.moving_cakes to authenticated;
create policy moving_cakes_select on public.moving_cakes for select to authenticated using (user_id = (select auth.uid()));

create table public.moving_thanks (
  village_id uuid not null references public.villages (id) on delete cascade,
  from_user uuid not null references auth.users (id) on delete cascade,
  to_user uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (village_id, from_user, to_user)
);
alter table public.moving_thanks enable row level security;
revoke all on public.moving_thanks from anon, authenticated, public;

-- 떡 돌리기: 이웃 모두에게. 돌린 이웃 수를 돌려준다.
create function public.give_moving_cakes(p_village uuid, p_kind text, p_note text) returns integer
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := public.require_user(); v_note text := left(btrim(coalesce(p_note, '')), 40); v_n integer := 0; r record;
begin
  if p_kind not in ('siru', 'rainbow', 'songpyeon') then raise exception 'invalid_kind'; end if;
  if not public.is_user_in_village(p_village, v_uid) then raise exception 'not_member'; end if;
  begin
    insert into public.moving_cakes (village_id, user_id, kind) values (p_village, v_uid, p_kind);
  exception when unique_violation then
    raise exception 'already_given';
  end;
  for r in select m.user_id from public.village_members m where m.village_id = p_village and m.user_id <> v_uid loop
    insert into public.gifts (from_user, to_user, kind, note) values (v_uid, r.user_id, p_kind, v_note);
    perform public._notify(p_village, r.user_id, 'moving_cake', p_kind || ':' || v_note);
    v_n := v_n + 1;
  end loop;
  return v_n;
end;
$$;
revoke all on function public.give_moving_cakes(uuid, text, text) from public, anon;
grant execute on function public.give_moving_cakes(uuid, text, text) to authenticated;

-- 떡 받은 이웃이 "잘 먹을게요": 같은 사람에게 한 번만
create function public.thank_moving_cake(p_village uuid, p_target uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := public.require_user();
begin
  perform public._same_village(p_village, p_target);
  if not exists (select 1 from public.moving_cakes c where c.village_id = p_village and c.user_id = p_target) then raise exception 'no_cake'; end if;
  begin
    insert into public.moving_thanks (village_id, from_user, to_user) values (p_village, v_uid, p_target);
  exception when unique_violation then
    raise exception 'already_thanked';
  end;
  perform public._notify(p_village, p_target, 'moving_thanks', '');
end;
$$;
revoke all on function public.thank_moving_cake(uuid, uuid) from public, anon;
grant execute on function public.thank_moving_cake(uuid, uuid) to authenticated;
