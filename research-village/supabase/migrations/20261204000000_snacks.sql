-- 건네기 간식을 종류별로 나눔: 요거트 찹쌀떡·약과·귤·사과·미니쉘·하리보 (예전 '간식' 선물은 그대로 읽힌다)
alter table public.gifts drop constraint gifts_kind_check;
alter table public.gifts add constraint gifts_kind_check check (kind in (
  'coffee', 'americano', 'snack', 'tea', 'beer', 'siru', 'rainbow', 'songpyeon',
  'mochi', 'yakgwa', 'tangerine', 'apple', 'minishell', 'haribo'));
