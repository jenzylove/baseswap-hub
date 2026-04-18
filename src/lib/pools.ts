export type Pool = {
  id: string;
  pair: [string, string];
  tvlUsd: number;
  apr: number;
  volume24h: number;
  rewardTokens: string[];
  featured?: boolean;
};

// Stablecoin-heavy pool list reflecting Arc's stablecoin-native focus.
export const POOLS: Pool[] = [
  { id: "usdc-usdt", pair: ["USDC", "USDT"], tvlUsd: 4_280_000, apr: 25.4, volume24h: 612_000, rewardTokens: ["STAR", "ARC"], featured: true },
  { id: "usdc-dai", pair: ["USDC", "DAI"], tvlUsd: 2_140_000, apr: 25.1, volume24h: 318_000, rewardTokens: ["STAR"] },
  { id: "usdc-pyusd", pair: ["USDC", "PYUSD"], tvlUsd: 1_580_000, apr: 24.8, volume24h: 204_000, rewardTokens: ["STAR", "ARC"] },
  { id: "usdc-eurc", pair: ["USDC", "EURC"], tvlUsd: 3_910_000, apr: 18.2, volume24h: 880_000, rewardTokens: ["STAR"] },
  { id: "wbtc-weth", pair: ["WBTC", "WETH"], tvlUsd: 2_750_000, apr: 12.6, volume24h: 540_000, rewardTokens: ["STAR"] },
  { id: "arc-usdc", pair: ["ARC", "USDC"], tvlUsd: 980_000, apr: 41.7, volume24h: 412_000, rewardTokens: ["STAR", "ARC"] },
];

export const formatUsd = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
};

export const formatNum = (n: number, digits = 4) =>
  n.toLocaleString(undefined, { maximumFractionDigits: digits });
