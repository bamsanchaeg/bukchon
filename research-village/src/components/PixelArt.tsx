"use client";
import { useEffect, useRef } from "react";
import { bake, type Grid } from "@/pixel/core";

/** 도트 그림을 크게 보여준다. sparkle 이면 반짝이는 별과 김이 천천히 움직인다 */
export default function PixelArt({ art: g, scale = 5, sparkle = false, label }: { art: Grid; scale?: number; sparkle?: boolean; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const src = bake(g);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    const W = g.w * scale, H = g.h * scale;
    // 반짝이 자리: 그림 위에 흩어진 열 곳 (고정)
    const spots = Array.from({ length: 9 }, (_, i) => ({ x: ((i * 37 + 11) % 93) / 100 * g.w, y: ((i * 53 + 7) % 71) / 100 * g.h + 1, phase: i * 0.9, big: i % 3 === 0 }));
    const star = (x: number, y: number, r: number, color: string) => {
      ctx.fillStyle = color;
      const u = scale;
      ctx.fillRect(x - u / 2, y - u / 2, u, u);
      for (let k = 1; k <= r; k++) {
        ctx.fillRect(x - u / 2 + k * u, y - u / 2, u, u); ctx.fillRect(x - u / 2 - k * u, y - u / 2, u, u);
        ctx.fillRect(x - u / 2, y - u / 2 + k * u, u, u); ctx.fillRect(x - u / 2, y - u / 2 - k * u, u, u);
      }
    };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(src, 0, 0, W, H);
      if (!sparkle) return;
      // 김
      for (let i = 0; i < 3; i++) {
        const p = ((t / 2600) + i / 3) % 1;
        ctx.globalAlpha = 0.75 * (1 - p);
        ctx.fillStyle = "#ffffff";
        const x = (g.w * (0.3 + i * 0.2) + Math.sin(p * 6 + i) * 1.5) * scale, y = (g.h * 0.45 - p * g.h * 0.4) * scale;
        ctx.fillRect(x, y, scale * (1 + p), scale * (1 + p));
      }
      ctx.globalAlpha = 1;
      // 반짝이
      for (const s of spots) {
        const a = reduced ? 1 : (Math.sin(t / 420 + s.phase) + 1) / 2;
        if (a < 0.45) continue;
        star(Math.round(s.x) * scale + scale / 2, Math.round(s.y) * scale + scale / 2, a > 0.85 && s.big ? 2 : 1, a > 0.8 ? "#ffffff" : "#ffe58a");
      }
    };
    draw(0);
    if (reduced || !sparkle) return;
    let raf = 0, last = 0;
    const loop = (t: number) => { raf = requestAnimationFrame(loop); if (t - last < 120) return; last = t; draw(t); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [g, scale, sparkle]);
  return <canvas ref={ref} width={g.w * scale} height={g.h * scale} role="img" aria-label={label} className="pixelated" style={{ width: g.w * scale, height: g.h * scale, maxWidth: "100%" }} />;
}
