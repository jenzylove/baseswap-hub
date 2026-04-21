import { useState } from "react";
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
import {
  ExternalLink,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Wallet,
  Network,
  Coins,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ConnectWallet } from "@/components/ConnectWallet";
import { arcTestnet } from "@/lib/chains";

const FAUCET_URL = "https://faucet.circle.com";

const shorten = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const Faucet = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const onArc = chainId === arcTestnet.id;

  // On Arc Testnet, USDC IS the native gas currency, so a plain useBalance()
  // call (without a `token` address) returns the user's USDC balance.
  const {
    data: balance,
    refetch: refetchBalance,
    isFetching: balanceLoading,
  } = useBalance({
    address,
    chainId: arcTestnet.id,
    query: { enabled: Boolean(address) && onArc },
  });

  const [hasRequested, setHasRequested] = useState(false);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success("Address copied");
  };

  const handleGetTokens = () => {
    setHasRequested(true);
    window.open(FAUCET_URL, "_blank", "noopener,noreferrer");
  };

  const handleRefresh = async () => {
    const result = await refetchBalance();
    if (result.data) {
      toast.success(
        `Balance: ${parseFloat(result.data.formatted).toFixed(4)} ${result.data.symbol}`,
      );
    }
  };

  const steps = [
    {
      icon: Wallet,
      title: "Connect your wallet",
      body: "Connect a wallet to receive testnet tokens at your address.",
      done: isConnected,
    },
    {
      icon: Network,
      title: "Switch to Arc Testnet",
      body: "Make sure your wallet is on Arc Testnet (Chain ID 5042002).",
      done: isConnected && onArc,
    },
    {
      icon: Coins,
      title: "Request tokens from Circle",
      body: "Click \"Get Testnet Tokens\", paste your address into the Circle faucet, and submit.",
      done: hasRequested,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow mb-5">
              <Droplets className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Arc Testnet Faucet
            </h1>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Get free testnet USDC from Circle's official faucet to start swapping and providing liquidity on Starlight.
            </p>
          </div>

          {/* Wallet card */}
          <Card className="p-6 md:p-8 rounded-3xl border-border/60 mb-6">
            {isConnected && address ? (
              <div className="rounded-2xl bg-secondary p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your wallet address
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
                <div className="text-xs text-muted-foreground mt-1.5">{shorten(address)}</div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your wallet to see your address and request testnet tokens.
                </p>
                <ConnectWallet />
              </div>
            )}

            {/* Network warning */}
            {isConnected && !onArc && (
              <div className="mt-4 rounded-2xl bg-warning/10 border border-warning/30 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-sm text-foreground">
                    Switch to Arc Testnet first
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You need to be on Arc Testnet (Chain ID{" "}
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
          </Card>

          {/* Step-by-step guide */}
          <Card className="p-6 md:p-8 rounded-3xl border-border/60 mb-6">
            <h2 className="font-display text-lg font-bold mb-5">How it works</h2>
            <ol className="space-y-4">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={i} className="flex gap-4">
                    <div
                      className={`shrink-0 h-10 w-10 rounded-xl grid place-items-center transition-colors ${
                        step.done
                          ? "bg-accent/15 text-accent"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Step {i + 1}
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-foreground mt-0.5">
                        {step.title}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{step.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>

          {/* CTA */}
          <Card className="p-6 md:p-8 rounded-3xl border-border/60">
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleGetTokens}
              disabled={isConnected && !onArc}
            >
              Get Testnet Tokens
              <ExternalLink className="h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Opens <span className="font-mono">faucet.circle.com</span> in a new tab. Paste your address to receive testnet USDC.
            </p>

            {/* Balance check — appears after they've clicked Get Tokens */}
            {hasRequested && isConnected && (
              <div className="mt-6 pt-6 border-t border-border/60">
                <div className="rounded-2xl bg-secondary p-4 mb-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Your USDC balance on Arc Testnet
                  </div>
                  <div className="font-display text-2xl font-bold">
                    {!onArc
                      ? "—"
                      : balance
                        ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                        : balanceLoading
                          ? "Loading…"
                          : "0.0000 USDC"}
                  </div>
                  {!onArc && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Switch to Arc Testnet to read your balance.
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleRefresh}
                  disabled={!onArc || balanceLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${balanceLoading ? "animate-spin" : ""}`} />
                  Check my balance
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Tokens usually arrive within a minute. Click to refresh.
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Faucet;
