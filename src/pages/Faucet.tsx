import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ExternalLink, Copy, AlertTriangle, CheckCircle2, Droplets } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { arcTestnet } from "@/lib/chains";

const FAUCET_URL = "https://faucet.circle.com";

const shorten = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const Faucet = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const onArc = chainId === arcTestnet.id;

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success("Address copied");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow mb-5">
              <Droplets className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Arc Testnet Faucet
            </h1>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Grab free testnet USDC from Circle's official faucet to start swapping and providing liquidity on Starlight.
            </p>
          </div>

          <Card className="p-6 md:p-8 rounded-3xl border-border/60">
            {/* Wallet status */}
            {isConnected && address ? (
              <div className="rounded-2xl bg-secondary p-4 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tokens will go to
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-sm md:text-base font-semibold break-all">
                    {address}
                  </code>
                  <Button variant="ghost" size="icon" onClick={copyAddress} className="shrink-0">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1.5">
                  {shorten(address)}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-4 mb-5 text-center">
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to see which address will receive testnet tokens.
                </p>
              </div>
            )}

            {/* Network warning */}
            {isConnected && !onArc && (
              <div className="rounded-2xl bg-warning/10 border border-warning/30 p-4 mb-5 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-sm text-foreground">
                    Switch to Arc Testnet first
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You need to be connected to Arc Testnet (Chain ID{" "}
                    <span className="font-mono font-semibold">5042002</span>) before requesting tokens.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => switchChain({ chainId: arcTestnet.id })}
                  >
                    Switch network
                  </Button>
                </div>
              </div>
            )}

            {isConnected && onArc && (
              <div className="rounded-2xl bg-accent/10 border border-accent/30 p-4 mb-5 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-sm text-foreground">
                    Connected to Arc Testnet
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You're all set. Click below to open the Circle faucet.
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            <Button variant="hero" size="lg" className="w-full" asChild>
              <a href={FAUCET_URL} target="_blank" rel="noopener noreferrer">
                Get tokens
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Opens <span className="font-mono">faucet.circle.com</span> in a new tab. Paste your address there to receive testnet USDC.
            </p>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Faucet;
