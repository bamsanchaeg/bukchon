-- 우리가 좋아하는 책: 마을 사람들이 도서관 책장의 원하는 단에 좋아하는 책을 꽂는다
create table public.favorite_books (
  id uuid primary key default gen_random_uuid(),
  village_id uuid not null references public.villages (id) on delete cascade,
  added_by uuid references auth.users (id) on delete set null default auth.uid(),
  title text not null check (char_length(btrim(title)) between 1 and 60),
  author text not null default '' check (char_length(author) <= 40),
  note text not null default '' check (char_length(note) <= 100),
  color text not null default 'red' check (color in ('red', 'orange', 'yellow', 'green', 'teal', 'blue', 'navy', 'purple', 'pink', 'brown', 'gray', 'cream')),
  shelf integer not null default 1 check (shelf between 1 and 4),
  created_at timestamptz not null default now()
);
create index favorite_books_village on public.favorite_books (village_id, shelf, created_at);
alter table public.favorite_books enable row level security;
revoke all on public.favorite_books from anon, authenticated, public;
grant select, delete on public.favorite_books to authenticated;
grant insert (village_id, title, author, note, color, shelf) on public.favorite_books to authenticated;
grant update (title, author, note, color, shelf) on public.favorite_books to authenticated;
create policy favorite_books_select on public.favorite_books for select to authenticated using (public.is_village_member(village_id));
create policy favorite_books_insert on public.favorite_books for insert to authenticated
  with check (added_by = (select auth.uid()) and public.is_village_member(village_id));
create policy favorite_books_update on public.favorite_books for update to authenticated
  using (added_by = (select auth.uid()) or public.is_village_admin(village_id))
  with check (added_by = (select auth.uid()) or public.is_village_admin(village_id));
create policy favorite_books_delete on public.favorite_books for delete to authenticated
  using (added_by = (select auth.uid()) or public.is_village_admin(village_id));

-- 한 단에는 14권까지, 한 사람당 마을에 30권까지
create function public.limit_favorite_books() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.favorite_books b where b.village_id = new.village_id and b.shelf = new.shelf and b.id <> new.id) >= 14 then
    raise exception 'shelf_full';
  end if;
  if tg_op = 'INSERT' and (select count(*) from public.favorite_books b where b.village_id = new.village_id and b.added_by = new.added_by) >= 30 then
    raise exception 'too_many_books';
  end if;
  return new;
end $$;
revoke all on function public.limit_favorite_books() from public, anon, authenticated;
create trigger favorite_books_limit before insert or update of shelf on public.favorite_books for each row execute function public.limit_favorite_books();
