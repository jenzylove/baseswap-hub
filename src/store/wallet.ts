import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAccount, useBalance } from "wagmi";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

type PointsState = {
  byAddress: Record
    string,
    {
      points: number;
      streakDays: number;
      lastClaimDate: string | null;
      swapsCount: number;
      volumeUsd: number;
      referrals: number;
    }
  >;
  referralCode: string;

  addPoints: (address: string, n: number) => void;
  recordSwap: (address: string, volumeUsd: number) => void;
  claimDaily: (address: string) => { ok: boolean; gained: number; newStreak: number };
  syncFromSupabase: (address: string, remote: { points: number; swapsCount: number; volumeUsd: number }) => void;
};

const genCode = () =>
  Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

const todayStr = () => new Date().toISOString().slice(0, 10);

const blank = () => ({
  points: 0,
  streakDays: 0,
  lastClaimDate: null as string | null,
  swapsCount: 0,
  volumeUsd: 0,
  referrals: 0,
});

const usePointsStore = create<PointsState>()(
  persist(
    (set, get) => ({
      byAddress: {},
      referralCode: genCode(),

      addPoints: (address, n) =>
        set((s) => {
          const cur = s.byAddress[address] ?? blank();
          return { byAddress: { ...s.byAddress, [address]: { ...cur, points: Math.round(cur.points + n) } } };
        }),

      recordSwap: (address, volumeUsd) =>
        set((s) => {
          const cur = s.byAddress[address] ?? blank();
          const earned = Math.max(1, Math.round(volumeUsd));
          return {
            byAddress: {
              ...s.byAddress,
              [address]: {
                ...cur,
                swapsCount: cur.swapsCount + 1,
                volumeUsd: cur.volumeUsd + volumeUsd,
                points: cur.points + earned,
              },
            },
          };
        }),

      claimDaily: (address) => {
        const cur = get().byAddress[address] ?? blank();
        const today = todayStr();
        if (cur.lastClaimDate === today) return { ok: false, gained: 0, newStreak: cur.streakDays };
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = cur.lastClaimDate === yesterday ? cur.streakDays + 1 : 1;
        const gained = 50 + Math.min(newStreak, 30) * 10;
        set((s) => ({
          byAddress: {
            ...s.byAddress,
            [address]: {
              ...cur,
              lastClaimDate: today,
              streakDays: newStreak,
              points: cur.points + gained,
            },
          },
        }));
        return { ok: true, gained, newStreak };
      },

      // Merges Supabase data — always takes the HIGHER value so we never lose points
      syncFromSupabase: (address, remote) =>
        set((s) => {
          const cur = s.byAddress[address] ?? blank();
          return {
            byAddress: {
              ...s.byAddress,
              [address]: {
                ...cur,
                points:     Math.max(cur.points,     remote.points),
                swapsCount: Math.max(cur.swapsCount, remote.swapsCount),
                volumeUsd:  Math.max(cur.volumeUsd,  remote.volumeUsd),
              },
            },
          };
        }),
    }),
    { name: "starlight-points-v2" }
  )
);

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const store = usePointsStore();
  const key = address?.toLowerCase() ?? "__guest__";
  const data = store.byAddress[key] ?? blank();

  // On wallet connect — fetch from Supabase and sync if remote is higher
  useEffect(() => {
    if (!address) return;

    const fetchAndSync = async () => {
      try {
        const { data: row } = await supabase
          .from("leaderboard")
          .select("points, swaps_count, volume_usd")
          .eq("wallet_address", address.toLowerCase())
          .maybeSingle();

        if (row) {
          store.syncFromSupabase(address.toLowerCase(), {
            points:     row.points      ?? 0,
            swapsCount: row.swaps_count ?? 0,
            volumeUsd:  row.volume_usd  ?? 0,
          });
        }
      } catch (err) {
        // Silent fail — localStorage still works as fallback
        console.warn("Supabase sync failed:", err);
      }
    };

    fetchAndSync();
  }, [address]); // runs every time a new wallet connects

  return {
    connected: isConnected,
    address: address ?? null,
    ethBalance: balance ? parseFloat(balance.formatted) : 0,
    nativeSymbol: balance?.symbol ?? "ETH",

    points: data.points,
    streakDays: data.streakDays,
    lastClaimDate: data.lastClaimDate,
    swapsCount: data.swapsCount,
    volumeUsd: data.volumeUsd,
    referralCode: store.referralCode,
    referrals: data.referrals,

    addPoints: (n: number) => store.addPoints(key, n),
    recordSwap: (volumeUsd: number) => store.recordSwap(key, volumeUsd),
    claimDaily: () => store.claimDaily(key),
  };
};