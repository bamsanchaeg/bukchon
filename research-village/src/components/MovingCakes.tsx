"use client";
import { useEffect, useMemo, useState } from "react";
import { errorMessage, supabase } from "@/lib/supabase";
import { TTEOK, type TteokKind } from "@/lib/social";
import { tteokGrid } from "@/pixel/tteok";
import PixelArt from "./PixelArt";
import { Notice, Window } from "./ui";

const DEFAULT_NOTE = "새로 이사 왔어요! 잘 부탁드려요";
const dismissKey = (villageId: string) => `rv.cakes.later.${villageId}`;

/** 이사 떡 돌리기: 마을마다 한 번, 이웃 모두의 책상에 떡을 올려 인사한다. 이미 돌렸으면 아무것도 보이지 않는다 */
export default function MovingCakes({ villageId, myId, neighbors, compact = false }: { villageId: string; myId: string; neighbors: number; compact?: boolean }) {
  const [given, setGiven] = useState<boolean | null>(null);
  const [later, setLater] = useState(() => {
    try { return !compact && localStorage.getItem(dismissKey(villageId)) === "1"; } catch { return false; }
  });
  const [kind, setKind] = useState<TteokKind>("siru");
  const [note, setNote] = useState(DEFAULT_NOTE);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const arts = useMemo(() => ({ siru: tteokGrid("siru"), rainbow: tteokGrid("rainbow"), songpyeon: tteokGrid("songpyeon") }), []);

  useEffect(() => {
    let alive = true;
    supabase().from("moving_cakes").select("kind").eq("village_id", villageId).eq("user_id", myId).maybeSingle()
      .then(({ data }) => { if (alive) setGiven(Boolean(data)); });
    return () => { alive = false; };
  }, [villageId, myId]);

  if (given === null || (given && !msg) || (later && !compact)) return null;

  const give = async () => {
    setBusy(true); setMsg(null);
    const { data, error } = await supabase().rpc("give_moving_cakes", { p_village: villageId, p_kind: kind, p_note: note.trim() });
    setBusy(false);
    if (error) { setMsg({ kind: "error", text: errorMessage(error).includes("already_given") ? "이 마을에서는 이미 떡을 돌렸어요." : errorMessage(error) }); return; }
    setGiven(true);
    setMsg({ kind: "ok", text: `이웃 ${data}명에게 떡을 돌렸어요 🍡` });
  };

  const body = given ? (
    msg && <Notice kind={msg.kind}>{msg.text}</Notice>
  ) : (
    <div className="space-y-3 p-3">
      <p className="text-sm text-ink-soft">이웃에게 떡을 돌려 인사해 보세요. 한 마을에 한 번만 돌릴 수 있고, 이웃 책상에 하루 동안 올라가요.</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="떡 고르기">
        {TTEOK.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={kind === t.id} onClick={() => setKind(t.id)} className={`card px-2 pb-1 pt-2 text-center ${kind === t.id ? "card-on" : "hover:bg-[#fff3c4]"}`}>
            <PixelArt art={arts[t.id]} scale={3} label={`${t.label} 도트 그림`} />
            <span className="block font-display text-sm">{t.label}</span>
          </button>
        ))}
      </div>
      <div>
        <label className="label" htmlFor={`cake-note-${compact ? "s" : "h"}`}>이웃에게 한마디</label>
        <input id={`cake-note-${compact ? "s" : "h"}`} className="input" maxLength={40} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary" disabled={busy || neighbors < 1} onClick={() => void give()}>떡 돌리기</button>
        {neighbors < 1 && <span className="text-xs text-ink-soft">이웃이 입주하면 돌릴 수 있어요.</span>}
        {!compact && <button type="button" className="btn" onClick={() => { setLater(true); try { localStorage.setItem(dismissKey(villageId), "1"); } catch { /* 무시 */ } }}>나중에</button>}
      </div>
    </div>
  );
  return <Window title="🍡 이사 떡 돌리기" tone="mint">{body}</Window>;
}
