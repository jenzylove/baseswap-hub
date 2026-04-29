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
    const { error } = await supabase.rpc("upsert_leaderboard", {
      p_wallet: wallet_address,
      p_points: points,
      p_swaps: swaps_count,
      p_volume: volume_usd,
    });
    if (error) console.error("Leaderboard upsert error:", error);
  } catch (err) {
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