import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import { arcTestnet } from "@/lib/chains";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { wagmiConfig } from "@/lib/wagmi";
import Index from "./pages/Index.tsx";
import Faucet from "./pages/Faucet.tsx";
import NotFound from "./pages/NotFound.tsx";
import Bridge from "./pages/Bridge.tsx";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

const RainbowKitWithTheme = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  return (
    <RainbowKitProvider
      initialChain={arcTestnet}
      theme={
        resolvedTheme === "dark"
          ? darkTheme({ accentColor: "hsl(220, 100%, 60%)", borderRadius: "large" })
          : lightTheme({ accentColor: "hsl(220, 100%, 50%)", borderRadius: "large" })
      }
      modalSize="compact"
    >
      {children}
    </RainbowKitProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWithTheme>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/faucet" element={<Faucet />} />
                <Route path="/bridge" element={<Bridge />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RainbowKitWithTheme>
      </QueryClientProvider>
    </WagmiProvider>
  </ThemeProvider>
);

export default App;
