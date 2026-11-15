"use client";
import { useState } from "react";
import type { Truck } from "@/lib/trucks";
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
  const night = truck.kind === "night";
  return (
    <Modal title={`${night ? "🌙" : "🍚"} ${truck.title}`} tone={night ? "lilac" : "mint"} onClose={onClose}>
      <div className="space-y-3">
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
