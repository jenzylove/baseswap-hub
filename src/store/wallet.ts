import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAccount, useBalance } from "wagmi";

/* ============================================================
   Points store — purely off-chain progression (swaps, streaks,
   referrals). Persisted in localStorage. Keyed by wallet address
   so different wallets keep separate points.
   ============================================================ */

type PointsState = {
  // Per-address state map
  byAddress: Record<
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
  referralCode: string; // global for this browser

  addPoints: (address: string, n: number) => void;
  recordSwap: (address: string, volumeUsd: number) => void;
  claimDaily: (address: string) => { ok: boolean; gained: number; newStreak: number };
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
    }),
    { name: "starlight-points-v2" }
  )
);

/* ============================================================
   Combined hook — real wagmi connection + persisted points.
   Returns the same shape consumers were using before.
   ============================================================ */

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const store = usePointsStore();
  const key = address?.toLowerCase() ?? "__guest__";
  const data = store.byAddress[key] ?? blank();

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
