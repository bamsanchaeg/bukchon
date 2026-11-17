"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { errorMessage, supabase } from "@/lib/supabase";
import { relativeTime } from "@/lib/time";
import type { FavBook } from "@/hooks/useFavBooks";
import { bake } from "@/pixel/core";
import { SHELF_H, SHELF_MAX, SHELF_NAMES, SHELF_W, SPINE_COLORS, SPINE_IDS, layoutShelf, shelfGrid, type SpineColor } from "@/pixel/shelf";
import { DndContext, DragOverlay, closestCenter, useDroppable, type DragEndEvent, type DragOverEvent, type DragStartEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem, useSortSensors } from "./Sortable";
import { Notice, Window } from "./ui";

const COLOR_NAME: Record<SpineColor, string> = { red: "빨강", orange: "주황", yellow: "노랑", green: "초록", teal: "청록", blue: "파랑", navy: "남색", purple: "보라", pink: "분홍", brown: "갈색", gray: "회색", cream: "크림" };
const ERRORS: [string, string][] = [["shelf_full", "이 단은 가득 찼어요. 다른 단에 꽂아 보세요."], ["too_many_books", "책장에는 모두 합쳐 40권까지 꽂을 수 있어요."]];
const SCALE = 4;
const tierId = (t: number) => `tier-${t}`;

function Tier({ tier, label, ids, byId, count, onPick, picked, header }: { tier: number; label: string; ids: string[]; byId: Map<string, FavBook>; count: number; onPick: (id: string) => void; picked: string | null; header: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: tierId(tier) });
  return (
    <div ref={setNodeRef} className="card p-2" style={{ background: isOver ? "#fff3c4" : undefined }} role="group" aria-label={`${label} (${count}/${SHELF_MAX})`}>
      {header}
      <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
        <div className="flex min-h-[34px] flex-wrap gap-1.5 pt-1">
          {ids.length === 0 && <span className="self-center text-xs text-ink-soft">여기로 끌어다 놓으세요</span>}
          {ids.map((id) => {
            const b = byId.get(id)!;
            return (
              <SortableItem key={id} id={id}>
                <button type="button" onClick={() => onPick(id)} aria-pressed={picked === id} aria-label={`${b.title}, ${label}`} className="flex max-w-[11rem] items-center gap-1 border border-ink bg-paper px-1.5 py-0.5 text-xs">
                  <span className="inline-block h-4 w-2 shrink-0" style={{ background: SPINE_COLORS[b.color as SpineColor] ?? "#e0605a" }} aria-hidden />
                  <span className="truncate">{b.title}</span>
                </button>
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
}

/** 연구실의 좋아하는 책장: 주인은 원하는 단에 책을 꽂고 옮기고 빼고, 방문한 이웃은 구경만 한다 */
export default function FavoriteShelf({ books, names, reload, editable, ownerName, bare = false }: { books: FavBook[] | null; names: Record<number, string>; reload: () => void; editable: boolean; ownerName: string; bare?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", author: "", note: "", color: "red" as SpineColor, shelf: 1 });
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sensors = useSortSensors();
  const tn = (t: number) => names[t] || SHELF_NAMES[t - 1];
  const [renaming, setRenaming] = useState<number | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const saveName = async (t: number, value: string) => {
    setMsg(null);
    const v = value.trim();
    const { error } = v ? await supabase().from("favorite_shelf_names").upsert({ shelf: t, name: v }, { onConflict: "owner_id,shelf" }) : await supabase().from("favorite_shelf_names").delete().eq("shelf", t);
    if (error) { fail(error); return; }
    setRenaming(null); reload();
  };
  const [cols, setCols] = useState<Record<number, string[]> | null>(null);   // 끄는 동안의 임시 배치
  const [dragId, setDragId] = useState<string | null>(null);
  const fail = (e: unknown) => { const t = errorMessage(e); setMsg({ kind: "error", text: ERRORS.find(([k]) => t.includes(k))?.[1] ?? t }); };

  const list = useMemo(() => books ?? [], [books]);
  const spines = useMemo(() => layoutShelf(list), [list]);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(bake(shelfGrid(list, selected)), 0, 0, c.width, c.height);
  }, [list, selected]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const { error } = await supabase().from("favorite_books").insert({ title: form.title.trim(), author: form.author.trim(), note: form.note.trim(), color: form.color, shelf: form.shelf });
    setBusy(false);
    if (error) { fail(error); return; }
    setForm({ ...form, title: "", author: "", note: "" });
    setMsg({ kind: "ok", text: `‘${form.title.trim()}’을(를) ${tn(form.shelf)}에 꽂았어요 📚` });
    reload();
  };
  const sel = list.find((b) => b.id === selected) ?? null;
  const move = async (b: FavBook, shelf: number) => {
    setMsg(null);
    const { error } = await supabase().from("favorite_books").update({ shelf }).eq("id", b.id);
    if (error) fail(error); else { setMsg({ kind: "ok", text: `‘${tn(shelf)}’(으)로 옮겼어요.` }); reload(); }
  };
  const remove = async (b: FavBook) => {
    if (!window.confirm(`‘${b.title}’을(를) 책장에서 뺄까요?`)) return;
    const { error } = await supabase().from("favorite_books").delete().eq("id", b.id);
    if (error) { fail(error); return; }
    setSelected(null); reload();
  };
  const count = (t: number) => list.filter((b) => b.shelf === t).length;
  const byId = useMemo(() => new Map(list.map((b) => [b.id, b])), [list]);
  const base = useMemo(() => {
    const out: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const b of [...list].sort((a, c) => a.sort_order - c.sort_order || a.created_at.localeCompare(c.created_at))) out[b.shelf].push(b.id);
    return out;
  }, [list]);
  const layout = cols ?? base;
  const findTier = (id: string, from: Record<number, string[]>) => (id.startsWith("tier-") ? Number(id.slice(5)) : Number(Object.keys(from).find((k) => from[Number(k)].includes(id))));
  const onDragStart = (e: DragStartEvent) => { setDragId(String(e.active.id)); setCols(base); };
  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    setCols((prev) => {
      const cur = prev ?? base;
      const from = findTier(String(active.id), cur), to = findTier(String(over.id), cur);
      if (!from || !to || from === to || cur[to].length >= SHELF_MAX) return cur;
      const overIdx = String(over.id).startsWith("tier-") ? cur[to].length : cur[to].indexOf(String(over.id));
      return { ...cur, [from]: cur[from].filter((x) => x !== String(active.id)), [to]: [...cur[to].slice(0, overIdx), String(active.id), ...cur[to].slice(overIdx)] };
    });
  };
  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    let next = cols ?? base;
    if (over && !String(over.id).startsWith("tier-")) {
      const t = findTier(String(active.id), next), tOver = findTier(String(over.id), next);
      if (t && t === tOver) next = { ...next, [t]: arrayMove(next[t], next[t].indexOf(String(active.id)), next[t].indexOf(String(over.id))) };
    }
    setDragId(null);
    // 바뀐 자리만 저장한다 (단과 그 단 안의 순서)
    const changes: { id: string; shelf: number; pos: number }[] = [];
    for (const t of [1, 2, 3, 4]) next[t].forEach((id, i) => { const b = byId.get(id); if (b && (b.shelf !== t || b.sort_order !== i + 1)) changes.push({ id, shelf: t, pos: i + 1 }); });
    if (changes.length === 0) { setCols(null); return; }
    setMsg(null);
    // 다른 단으로 옮기는 책을 먼저 저장해 한 단이 일시적으로 차는 일이 없게 한다
    for (const c of changes.sort((a, b) => Number(byId.get(a.id)!.shelf === a.shelf) - Number(byId.get(b.id)!.shelf === b.shelf))) {
      const { error } = await supabase().from("favorite_books").update({ shelf: c.shelf, sort_order: c.pos }).eq("id", c.id);
      if (error) { fail(error); break; }
    }
    setCols(null);
    reload();
  };

  const inner = (
      <div className={`space-y-3 ${bare ? "" : "p-3"}`}>
        <p className="text-sm text-ink-soft">{editable ? "연구실 책장에 좋아하는 책을 단을 골라 꽂아 두세요. 이웃이 연구실에 놀러 오면 구경할 수 있어요." : "책등을 누르면 한마디를 볼 수 있어요."} 책등을 누르면 책이 뽑혀 나와요.</p>
        <div className="relative mx-auto w-full" style={{ maxWidth: SHELF_W * SCALE }}>
          <canvas ref={canvasRef} width={SHELF_W * SCALE} height={SHELF_H * SCALE} className="pixelated block w-full" style={{ height: "auto", aspectRatio: `${SHELF_W} / ${SHELF_H}` }} role="img" aria-label="좋아하는 책이 꽂힌 책장" />
          {spines.map((r) => {
            const b = list.find((x) => x.id === r.id)!;
            return (
              <button key={r.id} type="button" aria-pressed={selected === r.id} aria-label={`${b.title}${b.author ? ` — ${b.author}` : ""}, ${tn(b.shelf)}`} onClick={() => setSelected(selected === r.id ? null : r.id)}
                className="absolute"
                style={{ left: `${((r.x - 1) / SHELF_W) * 100}%`, top: `${((r.y - 4) / SHELF_H) * 100}%`, width: `${((r.w + 2) / SHELF_W) * 100}%`, height: `${((r.h + 4) / SHELF_H) * 100}%` }} />
            );
          })}
        </div>
        {Object.keys(names).length > 0 && (
          <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-ink-soft" aria-label="책장 단 이름">
            {[1, 2, 3, 4].map((t) => <li key={t}>{names[t] ? <>{t}단 · <span className="text-ink">{names[t]}</span></> : SHELF_NAMES[t - 1]}</li>)}
          </ul>
        )}
        {books === null && <p className="text-sm text-ink-soft">책장을 정리하는 중…</p>}
        {books?.length === 0 && <p className="text-center text-sm text-ink-soft">{editable ? "아직 꽂힌 책이 없어요. 첫 책을 꽂아 보세요." : "아직 꽂힌 책이 없어요."}</p>}
        {editable && list.length > 0 && (
          <section className="space-y-1" aria-label="책 정리하기">
            <p className="label">책 정리하기 <span className="text-ink-soft">(끌어서 순서와 단을 바꿔요. 폰은 꾹 눌러서 끌어요)</span></p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={(e) => void onDragEnd(e)} onDragCancel={() => { setDragId(null); setCols(null); }}>
              <div className="space-y-1.5">
                {[1, 2, 3, 4].map((t) => (
                  <Tier key={t} tier={t} label={tn(t)} ids={layout[t]} byId={byId} count={layout[t].length} picked={selected} onPick={(id) => setSelected(selected === id ? null : id)}
                    header={renaming === t ? (
                      <form className="flex flex-wrap items-center gap-1" onSubmit={(e) => { e.preventDefault(); void saveName(t, nameDraft); }}>
                        <label className="sr-only" htmlFor={`tier-name-${t}`}>{SHELF_NAMES[t - 1]} 이름</label>
                        <input id={`tier-name-${t}`} className="input !w-44" maxLength={20} placeholder="예: 여행, 어릴 때 읽은 책" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus />
                        <button type="submit" className="btn btn-primary btn-sm">저장</button>
                        <button type="button" className="btn btn-sm" onClick={() => void saveName(t, "")}>기본 이름으로</button>
                        <button type="button" className="btn btn-sm" onClick={() => setRenaming(null)}>취소</button>
                      </form>
                    ) : (
                      <p className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                        <span className="font-display text-sm text-ink">{tn(t)}</span> · {layout[t].length}/{SHELF_MAX}
                        <button type="button" className="btn btn-sm" onClick={() => { setNameDraft(names[t] ?? ""); setRenaming(t); }}>이름 바꾸기</button>
                      </p>
                    )} />
                ))}
              </div>
              <DragOverlay>{dragId && byId.get(dragId) ? <span className="border border-ink bg-paper px-1.5 py-0.5 text-xs shadow">{byId.get(dragId)!.title}</span> : null}</DragOverlay>
            </DndContext>
          </section>
        )}
        {sel && (
          <section className="card space-y-2 p-3" aria-label="고른 책">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block h-4 w-3" style={{ background: SPINE_COLORS[sel.color as SpineColor] ?? "#e0605a", border: "1px solid #3a2a33" }} aria-hidden />
              <h3 className="font-display text-lg">{sel.title}</h3>
              {sel.author && <span className="text-sm text-ink-soft">{sel.author}</span>}
            </div>
            <p className="text-xs text-ink-soft">{ownerName}님이 ‘{tn(sel.shelf)}’에 꽂았어요 · {relativeTime(sel.created_at)}</p>
            {sel.note && <p className="text-sm">“{sel.note}”</p>}
            {editable && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs text-ink-soft" htmlFor="fav-move">단 옮기기</label>
                <select id="fav-move" className="input !w-auto" value={sel.shelf} onChange={(e) => void move(sel, Number(e.target.value))}>
                  {SHELF_NAMES.map((_, i) => <option key={i} value={i + 1}>{tn(i + 1)}</option>)}
                </select>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => void remove(sel)}>책장에서 빼기</button>
              </div>
            )}
          </section>
        )}
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        {editable && <form onSubmit={add} className="card space-y-2 p-3" aria-label="책 꽂기">
          <p className="label">좋아하는 책 꽂기</p>
          <input className="input" aria-label="책 제목" placeholder="책 제목" maxLength={60} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input" aria-label="지은이" placeholder="지은이 (선택)" maxLength={40} value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <input className="input" aria-label="한마디" placeholder="이 책을 좋아하는 이유 한마디 (선택)" maxLength={100} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <div>
            <p className="text-xs text-ink-soft">책등 색</p>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="책등 색">
              {SPINE_IDS.map((c) => (
                <button key={c} type="button" role="radio" aria-checked={form.color === c} aria-label={COLOR_NAME[c]} onClick={() => setForm({ ...form, color: c })}
                  className="h-7 w-5" style={{ background: SPINE_COLORS[c], border: form.color === c ? "3px solid #3a2a33" : "1px solid #3a2a33" }} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm" htmlFor="fav-shelf">꽂을 단</label>
            <select id="fav-shelf" className="input !w-auto" value={form.shelf} onChange={(e) => setForm({ ...form, shelf: Number(e.target.value) })}>
              {SHELF_NAMES.map((_, i) => <option key={i} value={i + 1}>{tn(i + 1)} ({count(i + 1)}/{SHELF_MAX})</option>)}
            </select>
            <button type="submit" className="btn btn-primary" disabled={busy || !form.title.trim()}>책 꽂기</button>
          </div>
        </form>}
      </div>
  );
  return bare ? inner : <Window title={`${ownerName}님이 좋아하는 책`} tone="rose">{inner}</Window>;
}
