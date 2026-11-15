import { grid, outline, px, rect, disc, shade, stamp, type Grid } from "./core";

export const TRUCK_W = 48;
export const TRUCK_H = 34;
/** 광장 오른쪽 아래에 서 있는 트럭의 위치(바닥 가운데) */
export const TRUCK_POS = { x: 216, y: 199 };
/** 트럭이 서 있을 때 광장에서 쉬는 주민이 서는 자리(트럭 뒤에 가려지지 않게 가장자리로) */
export const TRUCK_REST_SPOTS = [
  { x: 180, y: 172 }, { x: 252, y: 170 }, { x: 196, y: 150 }, { x: 238, y: 150 }, { x: 164, y: 184 }, { x: 270, y: 178 },
];
/** 요리사 너구리가 서는 자리(트럭 오른쪽) */
export const RACCOON_POS = { x: 252, y: 201 };
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

/** 요리사 모자에 앞치마를 두른 너구리 (국자는 따로 그려 흔든다) */
export function raccoonGrid(): Grid {
  const t = grid(20, 26);
  const fur = "#9a96a6", furD = "#6f6b7c", cream = "#efe6d6", mask = "#3d3846", white = "#ffffff", coat = "#f4f4f8", coatD = "#d6d9e3";
  // 줄무늬 꼬리
  for (let i = 0; i < 6; i++) rect(t, 15 + (i % 2), 14 + i * 1, 4 - (i % 2), 1, i % 2 ? furD : fur);
  rect(t, 16, 20, 3, 1, furD);
  // 몸(요리사 옷 + 앞치마)
  rect(t, 5, 13, 9, 9, coat); rect(t, 5, 21, 9, 1, coatD); rect(t, 5, 13, 1, 9, coatD); rect(t, 13, 13, 1, 9, coatD);
  rect(t, 7, 16, 5, 6, "#ffffff"); rect(t, 7, 16, 5, 1, coatD);                      // 앞치마
  px(t, 9, 14, "#3a2a33"); px(t, 9, 18, "#c9ced6");
  rect(t, 8, 13, 3, 1, "#e0605a");                                                     // 목에 두른 빨간 스카프
  // 팔
  rect(t, 3, 14, 2, 6, coat); rect(t, 3, 19, 2, 2, fur);
  rect(t, 14, 13, 2, 5, coat); rect(t, 14, 17, 2, 2, fur);
  // 발
  rect(t, 6, 22, 3, 2, mask); rect(t, 10, 22, 3, 2, mask);
  // 머리
  disc(t, 9.5, 10, 5.5, 4.5, fur); rect(t, 5, 5, 2, 2, fur); rect(t, 12, 5, 2, 2, fur); px(t, 5, 5, furD); px(t, 13, 5, furD);
  disc(t, 9.5, 12, 3, 2, cream); px(t, 9, 11, "#2a2433"); px(t, 10, 11, "#2a2433");   // 주둥이와 코
  rect(t, 5, 8, 4, 2, mask); rect(t, 11, 8, 4, 2, mask); px(t, 7, 8, white); px(t, 12, 8, white); // 눈 가면 무늬
  px(t, 7, 9, "#2a2433"); px(t, 12, 9, "#2a2433");
  // 요리사 모자
  rect(t, 6, 4, 8, 1, white); rect(t, 6, 3, 8, 1, coatD);
  disc(t, 7, 1.5, 2, 2, white); disc(t, 12.5, 1.5, 2, 2, white); disc(t, 9.8, 0.8, 2.5, 1.8, white);
  px(t, 8, 2, coatD); px(t, 12, 2, coatD);
  const g = grid(22, 28);
  stamp(g, t, 1, 2);
  return outline(g);
}

/** 너구리가 휘젓는 국자 (손 위치를 기준으로 위로 길게) */
export function ladleGrid(): Grid {
  const g = grid(7, 14);
  rect(g, 3, 4, 1, 10, "#b87a4a"); px(g, 3, 13, "#8a5a3a");
  disc(g, 3, 2, 2.5, 1.8, "#c9ced6"); px(g, 2, 1, "#ffffff"); px(g, 3, 3, "#8e9aa8");
  return outline(g);
}
