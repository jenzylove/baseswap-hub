import { create } from "zustand";
import { persist } from "zustand/middleware";

type WalletState = {
  connected: boolean;
  address: string | null;
  ethBalance: number;
  points: number;
  streakDays: number;
  lastClaimDate: string | null;
  swapsCount: number;
  volumeUsd: number;
  referralCode: string;
  referrals: number;

  connect: () => void;
  disconnect: () => void;
  addPoints: (n: number) => void;
  recordSwap: (volumeUsd: number) => void;
  claimDaily: () => { ok: boolean; gained: number; newStreak: number };
};

const genAddress = () =>
  "0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

const genCode = () =>
  Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

const todayStr = () => new Date().toISOString().slice(0, 10);

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      connected: false,
      address: null,
      ethBalance: 1.842,
      points: 0,
      streakDays: 0,
      lastClaimDate: null,
      swapsCount: 0,
      volumeUsd: 0,
      referralCode: genCode(),
      referrals: 0,

      connect: () => set({ connected: true, address: genAddress() }),
      disconnect: () => set({ connected: false, address: null }),
      addPoints: (n) => set({ points: Math.round(get().points + n) }),
      recordSwap: (volumeUsd) => {
        const earned = Math.max(1, Math.round(volumeUsd * 1)); // 1 pt per $1
        set({
          swapsCount: get().swapsCount + 1,
          volumeUsd: get().volumeUsd + volumeUsd,
          points: get().points + earned,
        });
      },
      claimDaily: () => {
        const today = todayStr();
        const last = get().lastClaimDate;
        if (last === today) return { ok: false, gained: 0, newStreak: get().streakDays };

        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = last === yesterday ? get().streakDays + 1 : 1;
        const gained = 50 + Math.min(newStreak, 30) * 10; // streak bonus capped
        set({
          lastClaimDate: today,
          streakDays: newStreak,
          points: get().points + gained,
        });
        return { ok: true, gained, newStreak };
      },
    }),
    { name: "starlight-wallet" }
  )
);
