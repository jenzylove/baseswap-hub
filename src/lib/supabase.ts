import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type LeaderboardEntry = {
  wallet_address: string;
  points: number;
  swaps_count: number;
  volume_usd: number;
  updated_at: string;
};

export const upsertLeaderboard = async (
  wallet_address: string,
  points: number,
  swaps_count: number,
  volume_usd: number
) => {
  try {
    // Check if this wallet already exists in the leaderboard
    const { data: existing } = await supabase
      .from("leaderboard")
      .select("points, swaps_count, volume_usd")
      .eq("wallet_address", wallet_address)
      .maybeSingle(); // returns null instead of error if wallet not found

    // Add new values on top of existing ones (fresh wallet starts from 0)
    const newPoints  = (existing?.points      ?? 0) + points;
    const newSwaps   = (existing?.swaps_count ?? 0) + swaps_count;
    const newVolume  = (existing?.volume_usd  ?? 0) + volume_usd;

    const { error } = await supabase
      .from("leaderboard")
      .upsert(
        {
          wallet_address,
          points:      newPoints,
          swaps_count: newSwaps,
          volume_usd:  newVolume,
          updated_at:  new Date().toISOString(),
        },
        { onConflict: "wallet_address" }
      );

    if (error) console.error("Leaderboard upsert error:", error);
  } catch (err) {
    // Never let a Supabase error crash the swap flow
    console.error("Leaderboard upsert exception:", err);
  }
};

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("points", { ascending: false })
      .limit(10);

    if (error) { console.error("Leaderboard fetch error:", error); return []; }
    return data ?? [];
  } catch (err) {
    console.error("Leaderboard fetch exception:", err);
    return [];
  }
};