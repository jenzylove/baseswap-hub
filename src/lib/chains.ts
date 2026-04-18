import { defineChain } from "viem";

/**
 * Arc Sepolia — Circle's Arc L1 testnet.
 * Note: Arc is currently in private/invite-only testnet (late 2025).
 * Public RPC details may change once Circle opens it broadly.
 * Sources: arc.network, docs.arc.network
 */
export const arcSepolia = defineChain({
  id: 10241025,
  name: "Arc Sepolia",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia.arc.network"] },
    public: { http: ["https://rpc.sepolia.arc.network"] },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://explorer.sepolia.arc.network" },
  },
  testnet: true,
});

/** Base Sepolia — fully public Ethereum L2 testnet, usable today. */
export const baseSepolia = defineChain({
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://sepolia.base.org"] },
    public: { http: ["https://sepolia.base.org"] },
  },
  blockExplorers: {
    default: { name: "Basescan", url: "https://sepolia.basescan.org" },
  },
  testnet: true,
});
