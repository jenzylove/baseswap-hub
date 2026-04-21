import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arcTestnet, baseSepolia } from "./chains";

/**
 * WalletConnect projectId — get a free one at https://cloud.reown.com.
 * The placeholder below works for local dev but will rate-limit in production.
 * Replace via VITE_WALLETCONNECT_PROJECT_ID env var when ready to ship.
 */
const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "starlight-defi-demo";

export const wagmiConfig = getDefaultConfig({
  appName: "Starlight",
  projectId: WALLETCONNECT_PROJECT_ID,
  // Arc Testnet listed first → becomes the default network in RainbowKit.
  chains: [arcTestnet, baseSepolia],
  ssr: false,
});
