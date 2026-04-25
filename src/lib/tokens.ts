export type Token = {
  symbol: string;
  name: string;
  usd: number;
  chip: string;
  address: `0x${string}`;
  decimals: number;
};

export const ARC_TESTNET_CHAIN_ID = 5042002;

export const STARLIGHT_POOL_ADDRESS = "0xB70CBc5F65B2CEC9585cF061ac6b5CD9c462CE53" as `0x${string}`;

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

export const POOL_ABI = [
  {
    name: "swap",
    type: "function",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "addLiquidity",
    type: "function",
    inputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
    ],
    outputs: [{ name: "sharesMinted", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    name: "removeLiquidity",
    type: "function",
    inputs: [{ name: "shareAmount", type: "uint256" }],
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    name: "getAmountOut",
    type: "function",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "getReserves",
    type: "function",
    inputs: [],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    name: "shares",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "totalShares",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;