-- 던지기 종류 정리: 학위논문 · 마감 알림 · 학회 하고 남은 과자 (각주 폭탄·빨간 펜은 더 이상 보낼 수 없다. 예전 알림은 그대로 읽힌다)
create or replace function public.send_gesture(p_village uuid, p_target uuid, p_kind text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public._same_village(p_village, p_target);
  if p_kind not in ('thesis', 'alarm', 'snack') then raise exception 'invalid_kind'; end if;
  perform public._notify(p_village, p_target, 'gesture', p_kind);
end;
$$;
