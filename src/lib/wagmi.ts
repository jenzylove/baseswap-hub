import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { rainbowWallet, metaMaskWallet, rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

const connectors = connectorsForWallets(
  [{ groupName: "Recommended", wallets: [metaMaskWallet, rabbyWallet, rainbowWallet] }],
  { appName: "Starlight", projectId: "starlight-arc" }
);

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors,
  transports: { [arcTestnet.id]: http("https://rpc.testnet.arc.network") },
});