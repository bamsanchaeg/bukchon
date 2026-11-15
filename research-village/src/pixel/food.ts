import { disc, grid, outline, px, rect, shade, type Grid } from "./core";

export const FOOD_W = 40;
export const FOOD_H = 28;

export type FoodId = "tteokbokki" | "bungeoppang" | "ramyeon" | "doenjang" | "miyeok" | "kimchi" | "bugeo";

/** 위에서 비스듬히 본 그릇: 테두리·그림자·속 */
function dish(g: Grid, cx: number, cy: number, rx: number, rim: string, fill: string, ry = Math.max(2, Math.round(rx * 0.6))) {
  disc(g, cx, cy + 1, rx, ry, shade(rim, -45));
  disc(g, cx, cy, rx, ry, rim);
  disc(g, cx, cy, rx - 1.5, ry - 1, fill);
}

/** 한식 밥상 쟁반과 젓가락 */
function tray(g: Grid) {
  rect(g, 1, 3, 38, 23, "#6d4528"); rect(g, 2, 3, 36, 22, "#a8713f"); rect(g, 3, 4, 34, 20, "#c99763");
  rect(g, 3, 4, 34, 1, "#dcae7a");
  rect(g, 24, 23, 11, 1, "#f1e6c4"); rect(g, 24, 25, 11, 1, "#f1e6c4");
}

function rice(g: Grid, cx: number, cy: number) {
  dish(g, cx, cy, 6, "#f7f2e6", "#fffaf0");
  disc(g, cx, cy - 1, 4.5, 2.6, "#ffffff"); px(g, cx - 2, cy - 2, "#e9e4d8"); px(g, cx + 1, cy - 1, "#e9e4d8"); px(g, cx + 2, cy - 2, "#e9e4d8");
}

/** 뚝배기 */
function pot(g: Grid, cx: number, cy: number, broth: string) {
  dish(g, cx, cy, 7, "#5a3a2a", broth, 4);
  rect(g, cx - 9, cy, 2, 1, "#5a3a2a"); rect(g, cx + 8, cy, 2, 1, "#5a3a2a");
}

function side(g: Grid, cx: number, cy: number, fill: string, rim = "#f7f2e6") {
  dish(g, cx, cy, 4, rim, fill, 3);
}

const ART: Record<FoodId, (g: Grid) => void> = {
  // 매콤 떡볶이: 접시에 빨간 양념 떡볶이, 어묵, 대파, 꼬치
  tteokbokki(g) {
    dish(g, 20, 17, 17, "#f7f2e6", "#d9402a", 9);
    disc(g, 20, 17, 14, 7, "#e0502e"); disc(g, 17, 15, 8, 3, "#e9693f");
    const cakes: [number, number][] = [[11, 17], [15, 20], [19, 15], [24, 19], [28, 15], [22, 22], [14, 14], [30, 19], [26, 12]];
    for (const [x, y] of cakes) { rect(g, x, y, 5, 2, "#ffe7cc"); rect(g, x, y + 2, 5, 1, "#f2a07a"); px(g, x, y, "#ffd2a8"); }
    for (const [x, y] of [[17, 18], [27, 17], [13, 21]] as [number, number][]) { rect(g, x, y, 4, 2, "#f6c177"); px(g, x + 1, y, "#fff0c4"); }
    for (const [x, y] of [[21, 17], [13, 16], [29, 21], [25, 14]] as [number, number][]) { px(g, x, y, "#5fae4a"); px(g, x + 1, y, "#7fcf5e"); }
    rect(g, 31, 6, 1, 10, "#c99763"); px(g, 31, 5, "#c99763");
    rect(g, 30, 7, 3, 3, "#ffe7cc"); rect(g, 30, 10, 3, 1, "#f2a07a");
  },
  // 갓 구운 붕어빵: 종이 위에 붕어빵 세 마리
  bungeoppang(g) {
    rect(g, 3, 14, 34, 11, "#e8c795"); rect(g, 3, 14, 34, 1, "#f4dcae"); rect(g, 3, 24, 34, 1, "#c9a06a");
    for (const [x, y, c] of [[5, 6, "#d99a3a"], [17, 9, "#e3a845"], [21, 17, "#d28f33"]] as [number, number, string][]) {
      disc(g, x + 8, y + 4, 8, 4.2, c); disc(g, x + 8, y + 3, 6, 2.2, shade(c, 22));
      rect(g, x + 15, y + 2, 4, 5, c); px(g, x + 19, y + 1, c); px(g, x + 19, y + 7, c);   // 꼬리
      px(g, x + 3, y + 3, "#3a2a33"); px(g, x + 3, y + 2, "#ffffff");                       // 눈
      for (let i = 0; i < 4; i++) { px(g, x + 6 + i * 2, y + 3, shade(c, -30)); px(g, x + 7 + i * 2, y + 5, shade(c, -30)); }
      px(g, x + 2, y + 5, shade(c, -45)); px(g, x + 3, y + 5, shade(c, -45));                // 입
    }
  },
  // 컵라면 + 오뎅 꼬치
  ramyeon(g) {
    rect(g, 4, 10, 18, 3, "#fff3d6"); rect(g, 5, 9, 16, 1, "#e0605a");
    for (let y = 13; y < 24; y++) { const inset = Math.floor((y - 13) / 4); rect(g, 5 + inset, y, 16 - inset * 2, 1, (y % 3 === 0) ? "#e0605a" : "#fff3d6"); }
    rect(g, 6, 15, 14, 4, "#e0605a"); rect(g, 8, 16, 10, 2, "#ffe58a");
    disc(g, 13, 10, 8, 2.2, "#ffd98a"); for (let i = 0; i < 7; i++) rect(g, 7 + i * 2, 9 + (i % 2), 2, 1, "#f6c177");
    px(g, 12, 8, "#5fae4a"); px(g, 15, 9, "#5fae4a"); px(g, 17, 8, "#ffffff");
    rect(g, 22, 3, 1, 12, "#c99763"); rect(g, 24, 4, 1, 11, "#c99763");
    rect(g, 31, 3, 1, 22, "#c99763");
    disc(g, 31, 6, 3.5, 2, "#fff0d6"); disc(g, 31, 6, 2, 1, "#f2a0a8");
    disc(g, 31, 12, 3.5, 2.2, "#f6c177"); px(g, 30, 11, "#fff0c4");
    disc(g, 31, 18, 3.5, 2.2, "#fff6e0"); px(g, 30, 17, "#ffffff");
    rect(g, 28, 24, 6, 1, "#8a5a3a");
    dish(g, 35, 22, 3, "#f7f2e6", "#d9a05a", 2);
  },
  // 된장찌개 백반
  doenjang(g) {
    tray(g); rice(g, 10, 18); pot(g, 27, 17, "#a8742f");
    for (const [x, y] of [[24, 17], [28, 16], [30, 19]] as [number, number][]) rect(g, x, y, 3, 2, "#fff3d0");
    px(g, 27, 18, "#5fae4a"); px(g, 26, 15, "#5fae4a"); px(g, 29, 14, "#d9402a");
    side(g, 10, 8, "#ffd65c"); rect(g, 8, 7, 5, 1, "#f2a03a"); rect(g, 8, 9, 5, 1, "#f2a03a");
    side(g, 20, 8, "#4f9a54"); px(g, 19, 7, "#7fcf74"); px(g, 21, 9, "#3f8a4e");
    side(g, 30, 8, "#d9402a"); px(g, 29, 7, "#ff8a6a"); px(g, 31, 9, "#a82a20");
  },
  // 미역국 밥상
  miyeok(g) {
    tray(g); rice(g, 10, 18); pot(g, 27, 17, "#3f6b3a");
    for (const [x, y] of [[23, 16], [26, 18], [29, 15], [30, 19], [25, 14]] as [number, number][]) { rect(g, x, y, 3, 1, "#1f4a26"); px(g, x + 1, y + 1, "#2d6a35"); }
    disc(g, 10, 8, 5.5, 2.8, "#f7f2e6"); disc(g, 10, 8, 4.5, 2, "#c98a4e"); px(g, 7, 8, "#3a2a33"); rect(g, 9, 7, 4, 1, "#e0a45c");
    side(g, 22, 8, "#8a5a3a"); for (const [x, y] of [[21, 7], [23, 8], [22, 9]] as [number, number][]) px(g, x, y, "#d9b070");
    side(g, 31, 8, "#d9402a"); px(g, 30, 7, "#ff8a6a"); px(g, 32, 9, "#a82a20");
  },
  // 김치찌개 백반
  kimchi(g) {
    tray(g); rice(g, 10, 18); pot(g, 27, 17, "#c93a22");
    for (const [x, y] of [[23, 16], [27, 15], [30, 18]] as [number, number][]) { rect(g, x, y, 4, 2, "#e8704a"); px(g, x, y, "#ffd2a8"); }
    rect(g, 25, 19, 3, 2, "#fff3d0"); px(g, 29, 14, "#5fae4a");
    side(g, 10, 8, "#ffe9a0"); rect(g, 8, 7, 2, 2, "#e0a53a"); rect(g, 11, 8, 2, 2, "#e0a53a");
    side(g, 20, 8, "#f4ecc8"); px(g, 19, 7, "#fff9de"); px(g, 21, 9, "#e8d9a0"); px(g, 20, 8, "#f6c177");
    rect(g, 28, 6, 7, 4, "#1f3a2a"); rect(g, 28, 6, 7, 1, "#2d5a3a"); rect(g, 31, 6, 1, 4, "#14281c");
  },
  // 북엇국 밥상
  bugeo(g) {
    tray(g); rice(g, 10, 18); pot(g, 27, 17, "#efe8d4");
    for (const [x, y] of [[24, 16], [28, 17], [26, 19]] as [number, number][]) { rect(g, x, y, 3, 1, "#f6f0dc"); px(g, x + 1, y, "#e8dcae"); }
    px(g, 29, 15, "#5fae4a"); px(g, 25, 14, "#5fae4a"); px(g, 30, 19, "#5fae4a"); px(g, 23, 18, "#ffd65c");
    side(g, 10, 8, "#7a4a2a"); for (const [x, y] of [[9, 7], [11, 8], [10, 9]] as [number, number][]) rect(g, x, y, 2, 1, "#b8743a");
    side(g, 20, 8, "#f2a03a"); for (const [x, y] of [[18, 8], [20, 7], [22, 9]] as [number, number][]) rect(g, x, y, 3, 1, "#ffd08a");
    side(g, 30, 8, "#d9402a"); for (const [x, y] of [[28, 8], [30, 7], [32, 9]] as [number, number][]) rect(g, x, y, 2, 2, "#ff8a6a");
  },
};

/** 메뉴 하나의 도트 그림 */
export function foodGrid(id: FoodId): Grid {
  const g = grid(FOOD_W, FOOD_H);
  ART[id](g);
  return outline(g);
}
