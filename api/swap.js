import { createPublicClient, createWalletClient, http, parseUnits } from "viem";

const ARC_TESTNET = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
};

const STABLEFX_ADDRESS = "0x867650F5eAe8df91445971f14d89fd84F0C9a9f8";
const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

const TOKENS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { tokenIn, tokenOut, amountIn, walletAddress } = req.body;

  if (!tokenIn || !tokenOut || !amountIn || !walletAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const tokenInAddress = TOKENS[tokenIn];
  const tokenOutAddress = TOKENS[tokenOut];

  if (!tokenInAddress || !tokenOutAddress) {
    return res.status(400).json({ error: "Unsupported token" });
  }

  return res.status(200).json({
    tokenIn: tokenInAddress,
    tokenOut: tokenOutAddress,
    amountIn,
    walletAddress,
    stableFxAddress: STABLEFX_ADDRESS,
    permit2Address: PERMIT2_ADDRESS,
    message: "Use these contract addresses to execute the swap on-chain via StableFX",
  });
}