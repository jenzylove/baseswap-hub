export type Token = {
  symbol: string;
  name: string;
  // Approximate USD price for the simulated quote
  usd: number;
  // Tailwind background + text classes for the chip avatar
  chip: string;
  // Mock balance for connected wallet
  balance: number;
};

// Arc is USDC-native (gas paid in USDC), with focus on stablecoin & RWA flows.
export const TOKENS: Token[] = [
  { symbol: "USDC", name: "USD Coin (native gas)", usd: 1.0, chip: "bg-gradient-to-br from-blue-500 to-blue-700 text-white", balance: 4218.55 },
  { symbol: "EURC", name: "Euro Coin", usd: 1.08, chip: "bg-gradient-to-br from-indigo-500 to-blue-700 text-white", balance: 980.21 },
  { symbol: "USDT", name: "Tether USD", usd: 1.0, chip: "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white", balance: 312.0 },
  { symbol: "DAI", name: "Dai Stablecoin", usd: 1.0, chip: "bg-gradient-to-br from-amber-400 to-amber-600 text-white", balance: 540.0 },
  { symbol: "PYUSD", name: "PayPal USD", usd: 1.0, chip: "bg-gradient-to-br from-sky-400 to-blue-600 text-white", balance: 250.5 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", usd: 96500, chip: "bg-gradient-to-br from-orange-400 to-orange-600 text-white", balance: 0.042 },
  { symbol: "WETH", name: "Wrapped Ether", usd: 3450, chip: "bg-gradient-to-br from-slate-500 to-slate-800 text-white", balance: 1.842 },
  { symbol: "ARC", name: "Arc Network", usd: 2.45, chip: "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white", balance: 1500 },
];

export const findToken = (symbol: string) => TOKENS.find((t) => t.symbol === symbol)!;
