export type Pool = {
  id: string;
  pair: [string, string];
  tvlUsd: number | null;
  apr: number | null;
  volume24h: number | null;
  rewardTokens: string[];
  featured?: boolean;
};

// Only pools whose tokens exist on Arc Testnet today.
// On-chain pool contracts aren't deployed yet, so metrics are null until launch.
export const POOLS: Pool[] = [
  {
    id: "usdc-eurc",
    pair: ["USDC", "EURC"],
    tvlUsd: null,
    apr: null,
    volume24h: null,
    rewardTokens: ["STAR"],
    featured: true,
  },
];

export const formatUsd = (n: number | null) => {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
};

export const formatApr = (n: number | null) => (n === null || n === undefined ? "—" : `${n.toFixed(1)}%`);

export const formatNum = (n: number, digits = 4) =>
  n.toLocaleString(undefined, { maximumFractionDigits: digits });
