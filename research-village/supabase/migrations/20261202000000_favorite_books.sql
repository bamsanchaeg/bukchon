-- 내 연구실의 좋아하는 책장: 연구실 주인이 4단 책장의 원하는 단에 좋아하는 책을 꽂는다. 연구실을 볼 수 있는 이웃은 구경할 수 있다.
create table public.favorite_books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 60),
  author text not null default '' check (char_length(author) <= 40),
  note text not null default '' check (char_length(note) <= 100),
  color text not null default 'red' check (color in ('red', 'orange', 'yellow', 'green', 'teal', 'blue', 'navy', 'purple', 'pink', 'brown', 'gray', 'cream')),
  shelf integer not null default 1 check (shelf between 1 and 4),
  created_at timestamptz not null default now()
);
create index favorite_books_owner on public.favorite_books (owner_id, shelf, created_at);
alter table public.favorite_books enable row level security;
revoke all on public.favorite_books from anon, authenticated, public;
grant select, delete on public.favorite_books to authenticated;
grant insert (title, author, note, color, shelf) on public.favorite_books to authenticated;
grant update (title, author, note, color, shelf) on public.favorite_books to authenticated;
create policy favorite_books_select on public.favorite_books for select to authenticated
  using (owner_id = (select auth.uid()) or public.can_see_room(owner_id));
create policy favorite_books_insert on public.favorite_books for insert to authenticated with check (owner_id = (select auth.uid()));
create policy favorite_books_update on public.favorite_books for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy favorite_books_delete on public.favorite_books for delete to authenticated using (owner_id = (select auth.uid()));

-- 한 단에는 14권까지, 한 사람은 모두 합쳐 40권까지
create function public.limit_favorite_books() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.favorite_books b where b.owner_id = new.owner_id and b.shelf = new.shelf and b.id <> new.id) >= 14 then
    raise exception 'shelf_full';
  end if;
  if tg_op = 'INSERT' and (select count(*) from public.favorite_books b where b.owner_id = new.owner_id) >= 40 then
    raise exception 'too_many_books';
  end if;
  return new;
end $$;
revoke all on function public.limit_favorite_books() from public, anon, authenticated;
create trigger favorite_books_limit before insert or update of shelf on public.favorite_books for each row execute function public.limit_favorite_books();
