"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const KEY = (userId: string, villageId: string) => `rv.news.seen.${userId}.${villageId}`;
const readSeen = (userId: string, villageId: string) => {
  try { return localStorage.getItem(KEY(userId, villageId)); } catch { return null; }
};

/** 마을 게시판에 아직 안 읽은 새 글 수(내가 쓴 글은 제외). 게시판을 열면 읽은 것으로 친다(이 기기에 기억) */
export function useNewsBadge(villageId: string, userId: string) {
  const [posts, setPosts] = useState<{ author_id: string | null; created_at: string }[]>([]);
  const [seen, setSeen] = useState<string | null>(() => readSeen(userId, villageId));

  useEffect(() => {
    const sb = supabase();
    let alive = true;
    const load = async () => {
      const { data } = await sb.from("news_posts").select("author_id, created_at").eq("village_id", villageId).order("created_at", { ascending: false }).limit(100);
      if (!alive || !data) return;
      setPosts(data);
      // 처음 쓰는 기기: 이미 있던 글은 새 글로 치지 않는다
      if (readSeen(userId, villageId) === null) {
        const newest = data[0]?.created_at ?? new Date().toISOString();
        try { localStorage.setItem(KEY(userId, villageId), newest); } catch { /* 무시 */ }
        setSeen(newest);
      }
    };
    void load();
    const channel = sb.channel(`news-badge:${villageId}:${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "news_posts" }, () => void load())
      .subscribe();
    return () => { alive = false; void sb.removeChannel(channel); };
  }, [villageId, userId]);

  const markSeen = useCallback(() => {
    const now = new Date().toISOString();
    try { localStorage.setItem(KEY(userId, villageId), now); } catch { /* 무시 */ }
    setSeen(now);
  }, [userId, villageId]);

  const count = seen ? posts.filter((p) => p.author_id !== userId && p.created_at > seen).length : 0;
  return { count, markSeen };
}
