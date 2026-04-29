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
  const { error } = await supabase
    .from("leaderboard")
    .upsert(
      { wallet_address, points, swaps_count, volume_usd, updated_at: new Date().toISOString() },
      { onConflict: "wallet_address" }
    );
  if (error) console.error("Leaderboard upsert error:", error);
};

export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("points", { ascending: false })
    .limit(10);
  if (error) { console.error("Leaderboard fetch error:", error); return []; }
  return data ?? [];
};