"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface FavBook { id: string; title: string; author: string; note: string; color: string; shelf: number; created_at: string }

/** 연구실 주인의 좋아하는 책. reload 를 부르면 다시 읽는다 */
export function useFavBooks(ownerId: string) {
  const [books, setBooks] = useState<FavBook[] | null>(null);
  const [round, setRound] = useState(0);
  useEffect(() => {
    let alive = true;
    supabase().from("favorite_books").select("id, title, author, note, color, shelf, created_at").eq("owner_id", ownerId).order("created_at")
      .then(({ data }) => { if (alive) setBooks((data as FavBook[]) ?? []); });
    return () => { alive = false; };
  }, [ownerId, round]);
  return { books, reload: () => setRound((n) => n + 1) };
}
