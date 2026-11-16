-- 끌어서 순서 바꾸기: 도서관 책, 연구실 연구 성과, 연구실 좋아하는 책의 순서를 저장한다
alter table public.books add column sort_order integer not null default 0;
alter table public.achievements add column sort_order integer not null default 0;
alter table public.favorite_books add column sort_order integer not null default 0;
-- 내 연구 성과·내 좋아하는 책은 주인이 직접 순서를 바꾼다 (행 수정 정책이 주인만 허용)
grant update (sort_order) on public.achievements to authenticated;
grant update (sort_order) on public.favorite_books to authenticated;
-- 도서관의 함께 쓰는 책은 마을 주민 누구나 책장 순서를 정리할 수 있다 (순서 값만 바뀐다)
create function public.reorder_books(p_village uuid, p_ids uuid[]) returns void
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := public.require_user();
begin
  if not public.is_user_in_village(p_village, v_uid) then raise exception 'not_member'; end if;
  update public.books b set sort_order = x.i::integer
    from unnest(p_ids) with ordinality as x(id, i)
    where b.id = x.id and b.village_id = p_village;
end;
$$;
revoke all on function public.reorder_books(uuid, uuid[]) from public, anon;
grant execute on function public.reorder_books(uuid, uuid[]) to authenticated;
