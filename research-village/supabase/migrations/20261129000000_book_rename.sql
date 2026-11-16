-- 함께 쓰는 책 제목·주제 고치기: 책을 시작한 사람과 마을 장(관리자)이 할 수 있다 (지우기와 같은 규칙)
drop policy books_update on public.books;
create policy books_update on public.books for update to authenticated
  using (created_by = (select auth.uid()) or public.is_village_admin(village_id))
  with check (created_by = (select auth.uid()) or public.is_village_admin(village_id));
