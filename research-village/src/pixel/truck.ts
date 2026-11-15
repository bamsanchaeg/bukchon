import { grid, outline, px, rect, disc, shade, stamp, type Grid } from "./core";

export const TRUCK_W = 48;
export const TRUCK_H = 34;
/** 광장 오른쪽 아래에 서 있는 트럭의 위치(바닥 가운데) */
export const TRUCK_POS = { x: 304, y: 207 };
/** 스프라이트 안에서 배식 창문 가운데(김이 올라오는 곳)와 차양 아랫줄 */
export const TRUCK_WINDOW = { x: 18, y: 15 };
export const TRUCK_AWNING_Y = 16;

/** 야식 트럭(남색 차체·빨간 차양)과 아침 밥차(크림색 차체·초록 차양) */
export function truckGrid(kind: "night" | "morning"): Grid {
  const night = kind === "night";
  const t = grid(46, 30);
  const body = night ? "#3f4f86" : "#ffe9b3";
  const bodyD = shade(body, -30), bodyL = shade(body, 24);
  const a1 = night ? "#e0605a" : "#5fae78", a2 = "#fff3d6";
  // 차체: 짐칸과 운전석
  rect(t, 2, 9, 32, 17, body); rect(t, 2, 24, 32, 2, bodyD);
  rect(t, 33, 14, 12, 12, body); rect(t, 33, 21, 12, 1, bodyD);
  rect(t, 34, 15, 9, 6, "#a9d8f5"); rect(t, 35, 16, 3, 1, "#e8f6ff"); px(t, 35, 17, "#e8f6ff");
  rect(t, 44, 22, 2, 3, "#ffd98a"); rect(t, 44, 25, 2, 2, "#8a909c");
  rect(t, 1, 7, 34, 3, bodyL); rect(t, 1, 9, 34, 1, bodyD);
  // 배식 창문: 불이 켜진 안쪽과 선반 위 냄비
  rect(t, 6, 13, 22, 9, "#2b2433"); rect(t, 7, 14, 20, 7, night ? "#ffd98a" : "#fff0c4");
  rect(t, 9, 16, 4, 4, "#c9552e"); rect(t, 9, 15, 4, 1, "#e0a53a"); rect(t, 15, 17, 3, 3, "#e8e0d0"); rect(t, 20, 16, 5, 4, "#8e9aa8"); rect(t, 20, 15, 5, 1, "#c9ced6");
  rect(t, 6, 22, 22, 2, "#8a5a3a"); rect(t, 6, 22, 22, 1, "#b8743a");
  // 줄무늬 차양
  for (let x = 4; x < 30; x++) rect(t, x, 10, 1, 3, (x - 4) % 6 < 3 ? a1 : a2);
  for (let x = 4; x < 30; x += 3) px(t, x + 1, 13, (x - 4) % 6 < 3 ? a1 : a2);
  // 지붕 위 간판 (그릇 그림)
  rect(t, 11, 2, 16, 6, "#fff3d6"); rect(t, 11, 2, 16, 1, "#e8d9b0"); rect(t, 11, 7, 16, 1, "#e8d9b0");
  rect(t, 16, 5, 6, 2, night ? "#c9552e" : "#5fae78"); rect(t, 17, 4, 4, 1, night ? "#e0a53a" : "#ffffff"); px(t, 15, 5, "#8a5a3a"); px(t, 22, 5, "#8a5a3a");
  // 바퀴
  for (const cx of [9, 37]) { disc(t, cx, 26, 3.5, 3.5, "#2a2433"); disc(t, cx, 26, 1.6, 1.6, "#9aa0ab"); }
  const g = grid(TRUCK_W, TRUCK_H);
  stamp(g, t, 1, 3);
  return outline(g);
}
