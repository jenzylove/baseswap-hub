export type Token = {
  symbol: string;
  name: string;
  // Approximate USD price for the simulated quote
  usd: number;
  // Tailwind background + text classes for the chip avatar
  chip: string;
  // On-chain ERC-20 contract address on Arc Testnet
  address: `0x${string}`;
  // ERC-20 decimals
  decimals: number;
};

/**
 * Tokens that actually exist on Arc Testnet (Chain ID 5042002).
 * Balances are fetched live via wagmi's useBalance — no hardcoded amounts.
 */
export const TOKENS: Token[] = [
  {
    symbol: "USDC",
    name: "USD Coin (native gas)",
    usd: 1.0,
    chip: "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    usd: 1.08,
    chip: "bg-gradient-to-br from-indigo-500 to-blue-700 text-white",
    address: "0x08210F9170F89Ab7658F0B5E3fF39b0E03C2Af4",
    decimals: 6,
  },
];

export const findToken = (symbol: string) => TOKENS.find((t) => t.symbol === symbol) ?? TOKENS[0];

/** Arc Testnet chain ID — used for all token balance reads. */
export const ARC_TESTNET_CHAIN_ID = 5042002;
