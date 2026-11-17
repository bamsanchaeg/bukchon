"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface FavBook { id: string; title: string; author: string; note: string; color: string; shelf: number; sort_order: number; created_at: string }

/** 연구실 주인의 좋아하는 책. reload 를 부르면 다시 읽는다 */
export function useFavBooks(ownerId: string) {
  const [books, setBooks] = useState<FavBook[] | null>(null);
  const [names, setNames] = useState<Record<number, string>>({});
  const [round, setRound] = useState(0);
  useEffect(() => {
    let alive = true;
    supabase().from("favorite_books").select("id, title, author, note, color, shelf, sort_order, created_at").eq("owner_id", ownerId).order("sort_order").order("created_at")
      .then(({ data }) => { if (alive) setBooks((data as FavBook[]) ?? []); });
    supabase().from("favorite_shelf_names").select("shelf, name").eq("owner_id", ownerId)
      .then(({ data }) => { if (alive) setNames(Object.fromEntries((data ?? []).map((r) => [r.shelf as number, r.name as string]))); });
    return () => { alive = false; };
  }, [ownerId, round]);
  return { books, names, reload: () => setRound((n) => n + 1) };
}
