import { grid, hash, px, rect, shade, type Grid } from "./core";

export const SHELF_W = 128;
export const TIER_H = 36;
export const TIER_COUNT = 4;
export const SHELF_H = 8 + TIER_COUNT * TIER_H;
export const SHELF_MAX = 14;
export const SHELF_NAMES = ["맨 위 단", "두 번째 단", "세 번째 단", "맨 아래 단"] as const;

export const SPINE_COLORS = {
  red: "#e0605a", orange: "#f0994a", yellow: "#f2c64e", green: "#62b866", teal: "#4fb7a8", blue: "#5f8fd6",
  navy: "#3f4f86", purple: "#b08ae0", pink: "#f7a8bf", brown: "#a8713f", gray: "#9aa0ab", cream: "#efe2c0",
} as const;
export type SpineColor = keyof typeof SPINE_COLORS;
export const SPINE_IDS = Object.keys(SPINE_COLORS) as SpineColor[];

export interface ShelfBook { id: string; title: string; color: string; shelf: number; sort_order: number; created_at: string }
export interface SpineRect { id: string; x: number; y: number; w: number; h: number; tier: number }

/** 단마다 왼쪽부터 차례로 꽂은 책등의 자리 */
export function layoutShelf(books: ShelfBook[]): SpineRect[] {
  const out: SpineRect[] = [];
  for (let t = 1; t <= TIER_COUNT; t++) {
    const base = 4 + t * TIER_H - 4;   // 이 단 선반 널빤지의 윗면
    let x = 8;
    for (const b of books.filter((k) => k.shelf === t).sort((a, c) => a.sort_order - c.sort_order || a.created_at.localeCompare(c.created_at))) {
      const seed = [...b.id].reduce((a, ch) => a + ch.charCodeAt(0), 0);
      const w = 5 + (seed % 2), h = 17 + (seed % 11);
      out.push({ id: b.id, x, y: base - h, w, h, tier: t });
      x += w + 1;
    }
  }
  return out;
}

/** 책장 도트 그림: 나무 틀, 단마다 선반, 꽂힌 책등. selectedId 의 책은 살짝 뽑혀 올라온다 */
export function shelfGrid(books: ShelfBook[], selectedId: string | null): Grid {
  const g = grid(SHELF_W, SHELF_H);
  const WOOD = "#8a5a3a", WOOD_L = "#b8743a", WOOD_D = "#5a3a26", BACK = "#6b4a30";
  rect(g, 0, 0, SHELF_W, SHELF_H, WOOD_D);
  rect(g, 4, 4, SHELF_W - 8, SHELF_H - 8, BACK);
  for (let y = 4; y < SHELF_H - 4; y += 4) for (let x = 4 + ((y / 4) % 2) * 3; x < SHELF_W - 4; x += 7) px(g, x, y, shade(BACK, -10));
  rect(g, 0, 0, SHELF_W, 4, WOOD); rect(g, 0, 0, SHELF_W, 1, WOOD_L);
  rect(g, 0, 0, 4, SHELF_H, WOOD); rect(g, SHELF_W - 4, 0, 4, SHELF_H, WOOD); rect(g, 0, 0, 1, SHELF_H, WOOD_L);
  for (let t = 1; t <= TIER_COUNT; t++) {
    const y = 4 + t * TIER_H - 4;
    rect(g, 0, y, SHELF_W, 4, WOOD); rect(g, 0, y, SHELF_W, 1, WOOD_L); rect(g, 0, y + 3, SHELF_W, 1, WOOD_D);
  }
  const byId = new Map(books.map((b) => [b.id, b]));
  for (const r of layoutShelf(books)) {
    const b = byId.get(r.id)!;
    const main = SPINE_COLORS[b.color as SpineColor] ?? SPINE_COLORS.red;
    const lift = r.id === selectedId ? 3 : 0;
    const y = r.y - lift, h = r.h;
    rect(g, r.x, y, r.w, h, main);
    rect(g, r.x, y, 1, h, shade(main, 38)); rect(g, r.x + r.w - 1, y, 1, h, shade(main, -42));
    rect(g, r.x, y, r.w, 1, shade(main, 24));
    const band = hash(r.x, r.tier) > 0.5 ? "#fff8e4" : shade(main, 55);
    rect(g, r.x + 1, y + 3, r.w - 2, 1, band); rect(g, r.x + 1, y + h - 5, r.w - 2, 1, band);
    if (hash(r.x, r.y) > 0.45) rect(g, r.x + 1, y + Math.floor(h / 2), r.w - 2, 2, shade(main, -22));
    if (lift) { rect(g, r.x - 1, y - 1, r.w + 2, 1, "#fff8e4"); rect(g, r.x - 1, y, 1, h, "#fff8e4"); rect(g, r.x + r.w, y, 1, h, "#fff8e4"); }
  }
  return g;
}
