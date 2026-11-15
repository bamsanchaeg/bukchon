/** 마을 광장에 가끔 오는 트럭: 새벽 야식 트럭(2시~3시 30분, 2~4일에 한 번 꼴로 간헐적으로, 떡볶이→붕어빵→컵라면+오뎅 순서)과
 *  아침 한식 밥차(6시~9시 30분, 매일, 날마다 다른 밥상). 접속한 기기의 시계 기준이고, 알림은 보내지 않는다. */
import type { FoodId } from "@/pixel/food";

export type TruckKind = "night" | "morning";

export interface Truck {
  id: string;
  art: FoodId;
  kind: TruckKind;
  title: string;
  menu: string;
  items: string[];
  blurb: string;
  eat: string;
  bye: string;
}

const NIGHT_MENUS = [
  { art: "tteokbokki" as const, menu: "매콤 떡볶이", items: ["쌀떡볶이 한 접시", "튀김 두 개", "따뜻한 국물 한 컵"], blurb: "새벽 2시에 먹는 떡볶이는 칼로리가 없대요." },
  { art: "bungeoppang" as const, menu: "갓 구운 붕어빵", items: ["팥 붕어빵 세 마리", "슈크림 붕어빵 한 마리"], blurb: "머리부터 먹을까요, 꼬리부터 먹을까요?" },
  { art: "ramyeon" as const, menu: "컵라면 + 오뎅", items: ["컵라면", "오뎅 꼬치 두 개", "오뎅 국물은 무한 리필"], blurb: "국물까지 마시면 논문 한 줄 더 써져요." },
] as const;

const MORNING_MENUS = [
  { art: "doenjang" as const, menu: "된장찌개 백반", items: ["흰쌀밥", "구수한 된장찌개", "계란말이", "시금치나물", "김치"] },
  { art: "miyeok" as const, menu: "미역국 밥상", items: ["흰쌀밥", "미역국", "조기구이", "멸치볶음", "김치"] },
  { art: "kimchi" as const, menu: "김치찌개 백반", items: ["흰쌀밥", "김치찌개", "두부부침", "콩나물무침", "김구이"] },
  { art: "bugeo" as const, menu: "북엇국 밥상", items: ["흰쌀밥", "북엇국", "감자조림", "어묵볶음", "깍두기"] },
] as const;

/** 기기 시계의 날짜를 하루 단위 번호로 (시간대와 상관없이 같은 달력 날짜는 같은 번호) */
const dayNum = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
const START_DAY = 20000;

function mix(n: number): number {
  let x = (n ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0;
}

/** 이 날이 야식 트럭이 오는 날이면 몇 번째 방문인지, 아니면 -1. 모두에게 같은 날이 걸리도록 날짜만으로 정해진다 */
export function nightVisitIndex(dn: number): number {
  if (dn < START_DAY) return -1;
  let day = START_DAY, i = 0;
  while (day < dn) { day += 2 + (mix(i) % 3); i++; }   // 방문 사이 간격은 2~4일
  return day === dn ? i : -1;
}

/** 지금 광장에 와 있는 트럭의 id (없으면 빈 문자열) */
export function activeTruckId(now: Date = new Date()): string {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const dn = dayNum(now);
  if (minutes >= 6 * 60 && minutes < 9 * 60 + 30) return `morning-${dn}`;
  if (minutes >= 2 * 60 && minutes < 3 * 60 + 30 && nightVisitIndex(dn) >= 0) return `night-${dn}`;
  return "";
}

export function truckFromId(id: string): Truck | null {
  const [kind, num] = id.split("-");
  const dn = Number(num);
  if (!Number.isFinite(dn)) return null;
  if (kind === "night") {
    const i = nightVisitIndex(dn);
    if (i < 0) return null;
    const m = NIGHT_MENUS[i % NIGHT_MENUS.length];
    return { id, art: m.art, kind, title: "새벽 야식 트럭", menu: m.menu, items: [...m.items], blurb: m.blurb, eat: "잘 먹었어요! 새벽엔 역시 이 맛이죠.", bye: "배도 채웠으니 이제 슬슬 자요 🌙" };
  }
  if (kind === "morning") {
    const m = MORNING_MENUS[((dn % MORNING_MENUS.length) + MORNING_MENUS.length) % MORNING_MENUS.length];
    return { id, art: m.art, kind, title: "아침 밥차", menu: m.menu, items: [...m.items], blurb: "한식 아침밥상이 차려졌어요. 든든하게 드세요.", eat: "든든하게 잘 먹었어요. 오늘도 힘내요!", bye: "" };
  }
  return null;
}
