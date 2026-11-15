/** 업데이트 소식. 새 기능을 올릴 때마다 맨 위에 항목을 하나 추가한다(id 는 겹치지 않게 날짜-이름으로).
 *  사용자가 접속하면 아직 못 본 항목이 홈 위쪽 "새 소식"에 뜬다. 푸시 알림은 보내지 않는다. */
export interface UpdateEntry {
  id: string;
  date: string;
  title: string;
  body: string;
}

export const UPDATES: UpdateEntry[] = [
  { id: "2026-11-15-dolsang", date: "11월 15일", title: "소품에 돌잔치 돌상이 추가되었어요", body: "연구실 꾸미기 → 소품에서 ‘돌잔치 돌상’을 고르면 벽에 HAPPY BIRTHDAY 깃발이 걸리고 풍선과 돌상이 놓여요." },
  { id: "2026-11-15-truck", date: "11월 15일", title: "광장에 트럭이 와요", body: "새벽 2시~3시 30분에는 가끔 야식 트럭(떡볶이·붕어빵·컵라면+오뎅 순서로), 아침 6시~9시 30분에는 매일 한식 밥차가 와요. 누르면 너구리 요리사가 메뉴를 보여 줘요." },
  { id: "2026-11-15-gestures", date: "11월 15일", title: "던지기가 새로워졌어요", body: "학위논문, 마감 알림, 학회 하고 남은 과자를 던질 수 있어요." },
  { id: "2026-11-14-bubble", date: "11월 14일", title: "말풍선이 바꾸기 전까지 유지돼요", body: "오늘의 말풍선은 이제 시간이 지나도 사라지지 않고 바꾸거나 지울 때까지 남아요." },
  { id: "2026-11-13-beer", date: "11월 13일", title: "건네기에 맥주, 소품에 맥주 발효통", body: "이웃 책상에 맥주를 올려 둘 수 있고, 연구실 소품에 맥주 발효통이 생겼어요." },
  { id: "2026-11-13-push", date: "11월 13일", title: "폰에 앱처럼 설치하고 알림 받기", body: "홈 화면에 추가하면 앱처럼 열려요. 설정의 ‘폰 알림’을 켜면 이웃의 던지기·선물·메시지를 폰 알림으로 받아요." },
];

const KEY = (userId: string) => `rv.updates.${userId}`;

/** 아직 안 본 항목들 (최신순). 마지막으로 본 항목 id 를 이 기기에 기억한다 */
export function unseenUpdates(userId: string): UpdateEntry[] {
  let seen: string | null = null;
  try { seen = localStorage.getItem(KEY(userId)); } catch { /* 저장소를 못 써도 괜찮다 */ }
  const i = seen ? UPDATES.findIndex((u) => u.id === seen) : -1;
  return i >= 0 ? UPDATES.slice(0, i) : UPDATES.slice(0, 5);
}

export function markUpdatesSeen(userId: string) {
  try { localStorage.setItem(KEY(userId), UPDATES[0].id); } catch { /* 무시 */ }
}
