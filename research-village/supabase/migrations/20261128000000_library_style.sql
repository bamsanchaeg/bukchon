-- 마을 도서관 건물 모양: 마을 장(admin)만 바꿀 수 있다 (villages_update 정책이 admin 만 허용)
alter table public.villages
  add column library_style text not null default 'classic' check (library_style in ('classic', 'bicheondang'));
grant update (library_style) on public.villages to authenticated;
