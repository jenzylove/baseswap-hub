export type Token = {
  symbol: string;
  name: string;
  usd: number;
  chip: string;
  address: `0x${string}`;
  decimals: number;
};

export const ARC_TESTNET_CHAIN_ID = 5042002;

export const TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    usd: 1.0,
    chip: "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
    address: "0x3600000000000000000000000000000000000000",
    decimals: 6,
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    usd: 1.08,
    chip: "bg-gradient-to-br from-indigo-500 to-blue-700 text-white",
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    decimals: 6,
  },
];

export const findToken = (symbol: string) =>
  TOKENS.find((t) => t.symbol === symbol) ?? TOKENS[0];