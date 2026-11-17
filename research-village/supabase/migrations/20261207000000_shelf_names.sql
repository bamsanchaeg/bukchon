-- 좋아하는 책장의 단 이름: 연구실 주인이 단마다 테마 이름을 붙인다. 이름이 없는 단은 기본 이름(맨 위 단…)으로 보인다.
create table public.favorite_shelf_names (
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  shelf integer not null check (shelf between 1 and 4),
  name text not null check (char_length(btrim(name)) between 1 and 20),
  primary key (owner_id, shelf)
);
alter table public.favorite_shelf_names enable row level security;
revoke all on public.favorite_shelf_names from anon, authenticated, public;
grant select, delete on public.favorite_shelf_names to authenticated;
grant insert (shelf, name) on public.favorite_shelf_names to authenticated;
grant update (shelf, name) on public.favorite_shelf_names to authenticated;   -- 업서트가 단 값도 함께 쓴다
create policy shelf_names_select on public.favorite_shelf_names for select to authenticated
  using (owner_id = (select auth.uid()) or public.can_see_room(owner_id));
create policy shelf_names_insert on public.favorite_shelf_names for insert to authenticated with check (owner_id = (select auth.uid()));
create policy shelf_names_update on public.favorite_shelf_names for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy shelf_names_delete on public.favorite_shelf_names for delete to authenticated using (owner_id = (select auth.uid()));
