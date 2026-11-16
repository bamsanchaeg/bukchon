import { disc, grid, outline, px, rect, type Grid } from "./core";

export const TTEOK_W = 28;
export const TTEOK_H = 18;
export type TteokId = "siru" | "rainbow" | "songpyeon";

function plate(g: Grid) {
  disc(g, 14, 12, 13, 5, "#a79c8c"); disc(g, 14, 11, 13, 5, "#f7f2e6"); disc(g, 14, 11, 11, 3.5, "#fffaf0");
}

/** 이사 떡 접시 도트 그림 (보낼 떡을 고르는 카드와 받은 알림에 쓴다) */
export function tteokGrid(kind: TteokId): Grid {
  const g = grid(TTEOK_W, TTEOK_H);
  plate(g);
  if (kind === "siru") {
    // 팥시루떡: 붉은 팥고물과 흰 떡이 겹겹이 쌓인 네모 조각
    const piece = (x: number, y: number) => {
      const rows = ["#9b3f45", "#f6ead0", "#9b3f45", "#f6ead0", "#9b3f45"];
      rows.forEach((c, i) => rect(g, x, y + i * 1, 8, 1, c));
      rect(g, x, y + 5, 8, 1, "#7a2f36"); px(g, x + 1, y, "#c25a60"); px(g, x + 5, y + 2, "#c25a60");
    };
    piece(5, 5); piece(15, 5); piece(10, 9);
  } else if (kind === "rainbow") {
    // 무지개떡: 분홍·노랑·초록·하양 줄무늬 조각
    const piece = (x: number, y: number) => {
      ["#ff9fb6", "#ffe58a", "#a5e3a0", "#fffaf0", "#cdb8f2"].forEach((c, i) => rect(g, x, y + i, 9, 1, c));
      rect(g, x, y + 5, 9, 1, "#d9a05a"); px(g, x, y, "#ffd2dd");
    };
    piece(4, 5); piece(15, 5); piece(9, 9);
  } else {
    // 송편: 솔잎 위에 반달 모양 송편
    for (const [x, y] of [[5, 13], [8, 14], [12, 14], [17, 14], [20, 13], [14, 13]] as [number, number][]) rect(g, x, y, 3, 1, "#4f9a54");
    for (const [x, y, c] of [[6, 7, "#ffffff"], [12, 6, "#bfe8b0"], [17, 8, "#ffc9d6"], [10, 10, "#ffe58a"], [15, 10, "#ffffff"]] as [number, number, string][]) {
      disc(g, x + 3, y + 2, 3.2, 1.9, c); rect(g, x, y + 3, 7, 1, c); px(g, x + 2, y + 1, "#8a7a5a"); px(g, x + 4, y + 2, "#8a7a5a");
    }
  }
  return outline(g);
}
