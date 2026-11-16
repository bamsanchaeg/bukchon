"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { errorMessage, supabase } from "@/lib/supabase";
import { relativeTime } from "@/lib/time";
import type { FavBook } from "@/hooks/useFavBooks";
import { bake } from "@/pixel/core";
import { SHELF_H, SHELF_MAX, SHELF_NAMES, SHELF_W, SPINE_COLORS, SPINE_IDS, layoutShelf, shelfGrid, type SpineColor } from "@/pixel/shelf";
import { Notice, Window } from "./ui";

const COLOR_NAME: Record<SpineColor, string> = { red: "빨강", orange: "주황", yellow: "노랑", green: "초록", teal: "청록", blue: "파랑", navy: "남색", purple: "보라", pink: "분홍", brown: "갈색", gray: "회색", cream: "크림" };
const ERRORS: [string, string][] = [["shelf_full", "이 단은 가득 찼어요. 다른 단에 꽂아 보세요."], ["too_many_books", "책장에는 모두 합쳐 40권까지 꽂을 수 있어요."]];
const SCALE = 4;

/** 연구실의 좋아하는 책장: 주인은 원하는 단에 책을 꽂고 옮기고 빼고, 방문한 이웃은 구경만 한다 */
export default function FavoriteShelf({ books, reload, editable, ownerName, bare = false }: { books: FavBook[] | null; reload: () => void; editable: boolean; ownerName: string; bare?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", author: "", note: "", color: "red" as SpineColor, shelf: 1 });
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    setMsg({ kind: "ok", text: `‘${form.title.trim()}’을(를) ${SHELF_NAMES[form.shelf - 1]}에 꽂았어요 📚` });
    reload();
  };
  const sel = list.find((b) => b.id === selected) ?? null;
  const move = async (b: FavBook, shelf: number) => {
    setMsg(null);
    const { error } = await supabase().from("favorite_books").update({ shelf }).eq("id", b.id);
    if (error) fail(error); else { setMsg({ kind: "ok", text: `${SHELF_NAMES[shelf - 1]}으로 옮겼어요.` }); reload(); }
  };
  const remove = async (b: FavBook) => {
    if (!window.confirm(`‘${b.title}’을(를) 책장에서 뺄까요?`)) return;
    const { error } = await supabase().from("favorite_books").delete().eq("id", b.id);
    if (error) { fail(error); return; }
    setSelected(null); reload();
  };
  const count = (t: number) => list.filter((b) => b.shelf === t).length;

  const inner = (
      <div className={`space-y-3 ${bare ? "" : "p-3"}`}>
        <p className="text-sm text-ink-soft">{editable ? "연구실 책장에 좋아하는 책을 단을 골라 꽂아 두세요. 이웃이 연구실에 놀러 오면 구경할 수 있어요." : "책등을 누르면 한마디를 볼 수 있어요."} 책등을 누르면 책이 뽑혀 나와요.</p>
        <div className="relative mx-auto w-full" style={{ maxWidth: SHELF_W * SCALE }}>
          <canvas ref={canvasRef} width={SHELF_W * SCALE} height={SHELF_H * SCALE} className="pixelated block w-full" style={{ height: "auto", aspectRatio: `${SHELF_W} / ${SHELF_H}` }} role="img" aria-label="좋아하는 책이 꽂힌 책장" />
          {spines.map((r) => {
            const b = list.find((x) => x.id === r.id)!;
            return (
              <button key={r.id} type="button" aria-pressed={selected === r.id} aria-label={`${b.title}${b.author ? ` — ${b.author}` : ""}, ${SHELF_NAMES[b.shelf - 1]}`} onClick={() => setSelected(selected === r.id ? null : r.id)}
                className="absolute"
                style={{ left: `${((r.x - 1) / SHELF_W) * 100}%`, top: `${((r.y - 4) / SHELF_H) * 100}%`, width: `${((r.w + 2) / SHELF_W) * 100}%`, height: `${((r.h + 4) / SHELF_H) * 100}%` }} />
            );
          })}
        </div>
        {books === null && <p className="text-sm text-ink-soft">책장을 정리하는 중…</p>}
        {books?.length === 0 && <p className="text-center text-sm text-ink-soft">{editable ? "아직 꽂힌 책이 없어요. 첫 책을 꽂아 보세요." : "아직 꽂힌 책이 없어요."}</p>}
        {sel && (
          <section className="card space-y-2 p-3" aria-label="고른 책">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block h-4 w-3" style={{ background: SPINE_COLORS[sel.color as SpineColor] ?? "#e0605a", border: "1px solid #3a2a33" }} aria-hidden />
              <h3 className="font-display text-lg">{sel.title}</h3>
              {sel.author && <span className="text-sm text-ink-soft">{sel.author}</span>}
            </div>
            <p className="text-xs text-ink-soft">{ownerName}님이 {SHELF_NAMES[sel.shelf - 1]}에 꽂았어요 · {relativeTime(sel.created_at)}</p>
            {sel.note && <p className="text-sm">“{sel.note}”</p>}
            {editable && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs text-ink-soft" htmlFor="fav-move">단 옮기기</label>
                <select id="fav-move" className="input !w-auto" value={sel.shelf} onChange={(e) => void move(sel, Number(e.target.value))}>
                  {SHELF_NAMES.map((n, i) => <option key={n} value={i + 1}>{n}</option>)}
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
              {SHELF_NAMES.map((n, i) => <option key={n} value={i + 1}>{n} ({count(i + 1)}/{SHELF_MAX})</option>)}
            </select>
            <button type="submit" className="btn btn-primary" disabled={busy || !form.title.trim()}>책 꽂기</button>
          </div>
        </form>}
      </div>
  );
  return bare ? inner : <Window title={`${ownerName}님이 좋아하는 책`} tone="rose">{inner}</Window>;
}
