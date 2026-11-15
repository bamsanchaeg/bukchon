"use client";
import { useMemo, useState } from "react";
import type { Truck } from "@/lib/trucks";
import { foodGrid } from "@/pixel/food";
import { raccoonGrid } from "@/pixel/truck";
import PixelArt from "./PixelArt";
import { Modal } from "./ui";


const KEY = (id: string) => `rv.truck.${id}`;

/** 광장의 야식 트럭·아침 밥차 메뉴. 오늘 먹었는지는 이 기기에만 기억한다 */
export default function TruckDialog({ truck, onClose }: { truck: Truck; onClose: () => void }) {
  const [eaten, setEaten] = useState(() => {
    try { return localStorage.getItem(KEY(truck.id)) === "1"; } catch { return false; }
  });
  const eat = () => {
    setEaten(true);
    try { localStorage.setItem(KEY(truck.id), "1"); } catch { /* 기억 못 해도 괜찮다 */ }
  };
  const food = useMemo(() => foodGrid(truck.art), [truck.art]);
  const raccoon = useMemo(() => raccoonGrid(), []);
  const night = truck.kind === "night";
  return (
    <Modal title={`${night ? "🌙" : "🍚"} ${truck.title}`} tone={night ? "lilac" : "mint"} onClose={onClose}>
      <div className="space-y-3">
        <div className="card flex items-end gap-3 p-3" style={{ background: night ? "#f4efff" : "#fff6d9" }}>
          <div className="min-w-0 flex-1 text-center">
            <PixelArt art={food} scale={6} sparkle label={`${truck.menu} 도트 그림`} />
          </div>
          <div className="w-[88px] shrink-0 text-center">
            <PixelArt art={raccoon} scale={4} label="요리사 모자를 쓴 너구리" />
            <p className="text-xs text-ink-soft">너구리 요리사</p>
          </div>
        </div>
        <p className="card px-3 py-2 text-sm" role="note">“어서 오세요! 오늘은 {truck.menu} 나왔어요.”</p>
        <div>
          <p className="font-display text-xl">오늘의 메뉴 · {truck.menu}</p>
          <p className="text-sm text-ink-soft">{truck.blurb}</p>
        </div>
        <ul className="card space-y-1 p-3 text-sm" aria-label="차려진 음식">
          {truck.items.map((it) => <li key={it}>· {it}</li>)}
        </ul>
        {eaten ? (
          <div role="status" className="space-y-1">
            <p className="font-display">{truck.eat}</p>
            {truck.bye && <p className="text-sm text-ink-soft">{truck.bye}</p>}
          </div>
        ) : (
          <button type="button" className="btn btn-primary" onClick={eat}>맛있게 먹기</button>
        )}
      </div>
    </Modal>
  );
}
