import { grid, hash, px, rect, shade, outline, type Grid } from "./core";

export const MON_W = 27;
export const MON_H = 56;
/** 도서관 왼쪽 길가에 서 있는 비석의 위치(밑동 가운데) */
export const MON_POS = { x: 146, y: 108 };

/** 글자를 도트 폰트(11px)로 찍어 비석 표면에 새긴다 (브라우저에서만 쓴다) */
function engrave(g: Grid, text: string, cx: number, y0: number) {
  const c = document.createElement("canvas");
  c.width = 14; c.height = 14;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  const bitmaps = [...text].map(() => [] as [number, number][]);
  [...text].forEach((ch, i) => {
    ctx.clearRect(0, 0, 14, 14);
    ctx.font = '11px Galmuri11, Galmuri9, monospace';
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000";
    ctx.fillText(ch, 1, 0);
    const d = ctx.getImageData(0, 0, 14, 14).data;
    for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) if (d[(y * 14 + x) * 4 + 3] > 110) bitmaps[i].push([x, y]);
  });
  bitmaps.forEach((pts, i) => {
    for (const [x, y] of pts) px(g, cx - 6 + x + 1, y0 + i * 12 + y + 1, "#cfcfd8");      // 새긴 홈 아래쪽에 빛 받는 면
    for (const [x, y] of pts) px(g, cx - 6 + x, y0 + i * 12 + y, "#45454f");             // 새긴 글씨
  });
}

/** '문명원' 비석 */
export function monumentGrid(): Grid {
  const g = grid(MON_W, MON_H);
  const S = "#9d9da8", SL = "#c6c6d0", SD = "#6f6f7c", SDD = "#565662";
  // 받침돌
  rect(g, 1, 49, 25, 6, SD); rect(g, 1, 49, 25, 1, "#8a8a96"); rect(g, 3, 46, 21, 4, "#80808c"); rect(g, 3, 46, 21, 1, "#9a9aa6");
  // 비석 몸 (폭 19, 둥근 머리)
  rect(g, 4, 6, 19, 41, S);
  rect(g, 6, 3, 15, 3, S); rect(g, 8, 1, 11, 2, S); rect(g, 5, 4, 1, 2, S); rect(g, 21, 4, 1, 2, S);
  rect(g, 4, 6, 2, 41, SL); rect(g, 6, 3, 1, 3, SL); rect(g, 8, 1, 1, 2, SL); rect(g, 8, 1, 11, 1, "#b5b5c0");
  rect(g, 21, 6, 2, 41, SD); rect(g, 20, 3, 1, 3, SD); rect(g, 18, 2, 1, 1, SD);
  rect(g, 4, 46, 19, 1, SDD);
  for (let i = 0; i < 46; i++) { const x = 5 + Math.floor(hash(i, 1) * 17), y = 4 + Math.floor(hash(i, 2) * 41); px(g, x, y, hash(i, 3) > 0.5 ? "#8c8c98" : "#aaaab6"); }
  rect(g, 8, 7, 11, 1, "#7a7a86");
  for (const [x, y, c] of [[5, 44, "#6f9a5a"], [6, 45, "#6f9a5a"], [7, 45, "#82ad6a"], [9, 46, "#6f9a5a"], [20, 45, "#6f9a5a"], [21, 44, "#82ad6a"], [5, 43, "#82ad6a"]] as [number, number, string][]) px(g, x, y, c);
  rect(g, 2, 54, 3, 1, "#6f9a5a"); rect(g, 21, 54, 4, 1, "#6f9a5a");
  for (const [x, y] of [[8, 10], [9, 11], [9, 12], [18, 41], [18, 42], [19, 43]] as [number, number][]) px(g, x, y, "#7a7a86");
  engrave(g, "문명원", 14, 9);
  return outline(g);
}

/** 비석이 먼지로 흩어지는 장면. t: 0(멀쩡함) ~ 1(사라짐). ctx 는 도트 1칸이 1픽셀인 그림판 */
export function drawMonumentBreak(ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, ox: number, oy: number, t: number) {
  if (t >= 1) return;
  const W = src.width, H = src.height;
  if (t < 0.18) {
    // 흔들린다
    const sh = Math.round(Math.sin(t * 140) * (t < 0.08 ? 1 : 2));
    ctx.drawImage(src, ox + sh, oy);
    return;
  }
  const u = (t - 0.18) / 0.82;                    // 0~1: 흩어지는 진행
  const B = 3;
  for (let by = 0; by < H; by += B) {
    for (let bx = 0; bx < W; bx += B) {
      const hh = hash(bx + 1, by + 7), h2 = hash(by + 3, bx + 11), h3 = hash(bx + by, 5);
      // 위쪽 조각부터, 가장자리 조각부터 먼저 흩어진다
      const delay = (1 - by / H) * 0.25 + Math.abs(bx - W / 2) / W * 0.15;
      const k = Math.min(1, Math.max(0, (u - delay) / (1 - delay - 0.05)));
      if (k <= 0) { ctx.drawImage(src, bx, by, B, B, ox + bx, oy + by, B, B); continue; }
      const alpha = 1 - k;
      if (alpha <= 0.02) continue;
      const dx = (bx - W / 2) * 0.5 * k + (hh - 0.5) * 22 * k + 6 * k * k;     // 바람에 실려 오른쪽으로
      const dy = -((h2 * 16 + 4) * k) + k * k * 6;
      const size = Math.max(1, Math.round(B * (1 - 0.6 * k)));
      ctx.globalAlpha = alpha;
      // 먼지색으로 바래며 흩어진다
      ctx.drawImage(src, bx, by, B, B, ox + bx + dx, oy + by + dy, size, size);
      if (k > 0.35 && h3 > 0.55) { ctx.fillStyle = "#e6dcc8"; ctx.fillRect(Math.round(ox + bx + dx + (hh - 0.5) * 6), Math.round(oy + by + dy - 2), 1, 1); }
    }
  }
  ctx.globalAlpha = 1;
}
