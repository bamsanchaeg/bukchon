import { disc, grid, outline, px, rect, type Grid } from "./core";

/** 광장 한쪽에 서 있는 소원구슬 (돌받침 위에 떠 있는 보랏빛 구슬) */
export const ORB_POS = { x: 288, y: 84 };
export const ORB_W = 20;
export const ORB_H = 28;

export function orbPedestalGrid(): Grid {
  const g = grid(ORB_W, 12);
  rect(g, 4, 7, 12, 4, "#b8b2c4"); rect(g, 4, 7, 12, 1, "#dcd7e6"); rect(g, 4, 10, 12, 1, "#8d869c");
  rect(g, 6, 3, 8, 4, "#cbc5d6"); rect(g, 6, 3, 8, 1, "#e6e2ee"); rect(g, 6, 6, 8, 1, "#9a93aa");
  rect(g, 2, 11, 16, 1, "#8d869c");
  for (const x of [7, 10, 13]) px(g, x, 8, "#9a93aa");
  return outline(g);
}

export function orbSphereGrid(): Grid {
  const g = grid(16, 16);
  disc(g, 7.5, 7.5, 7, 7, "#5b4cc4");
  disc(g, 7.5, 7.5, 6, 6, "#7b6bd6");
  disc(g, 8.5, 8.5, 4.5, 4.5, "#9a8cf0");
  disc(g, 9, 9, 2.5, 2.5, "#c3b9ff");
  // 안에서 소용돌이치는 반짝임
  for (const [x, y] of [[5, 10], [9, 5], [11, 9], [4, 6], [8, 11]] as [number, number][]) px(g, x, y, "#fff2a8");
  px(g, 10, 7, "#ffffff"); px(g, 9, 6, "#ffffff");
  // 유리 하이라이트
  rect(g, 3, 4, 2, 1, "#ffffff"); px(g, 3, 5, "#ffffff"); px(g, 4, 3, "#e8e2ff");
  return outline(g);
}
