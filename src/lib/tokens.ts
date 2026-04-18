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

export const TOKENS: Token[] = [
  { symbol: "ETH", name: "Ether", usd: 3450, chip: "bg-gradient-to-br from-slate-700 to-slate-900 text-white", balance: 1.842 },
  { symbol: "WETH", name: "Wrapped Ether", usd: 3450, chip: "bg-gradient-to-br from-slate-500 to-slate-700 text-white", balance: 0.5 },
  { symbol: "USDC", name: "USD Coin", usd: 1.0, chip: "bg-gradient-to-br from-blue-500 to-blue-700 text-white", balance: 4218.55 },
  { symbol: "USDbC", name: "Bridged USDC", usd: 1.0, chip: "bg-gradient-to-br from-blue-400 to-blue-600 text-white", balance: 312.0 },
  { symbol: "DAI", name: "Dai Stablecoin", usd: 1.0, chip: "bg-gradient-to-br from-amber-400 to-amber-600 text-white", balance: 980.21 },
  { symbol: "cbETH", name: "Coinbase Wrapped Staked ETH", usd: 3680, chip: "bg-gradient-to-br from-blue-600 to-indigo-700 text-white", balance: 0.12 },
  { symbol: "AERO", name: "Aerodrome", usd: 1.18, chip: "bg-gradient-to-br from-sky-400 to-cyan-600 text-white", balance: 1500 },
  { symbol: "DEGEN", name: "Degen", usd: 0.012, chip: "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white", balance: 250000 },
];

export const findToken = (symbol: string) => TOKENS.find((t) => t.symbol === symbol)!;
