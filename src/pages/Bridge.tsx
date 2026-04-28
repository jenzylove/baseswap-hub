import { useState } from "react";
import { useAccount, useWalletClient, usePublicClient, useBalance } from "wagmi";
import { createViemAdapterFromWalletClient } from "@circle-fin/adapter-viem-v2";
import { AppKit } from "@circle-fin/app-kit";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowRight, ArrowLeftRight, Loader2, ExternalLink, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { ARC_TESTNET_CHAIN_ID } from "@/lib/tokens";
import { cn } from "@/lib/utils";

const CHAINS = [
  { id: "Arc_Testnet",        label: "Arc Testnet",       color: "bg-blue-500",    chainId: ARC_TESTNET_CHAIN_ID },
  { id: "Ethereum_Sepolia",   label: "Ethereum Sepolia",  color: "bg-slate-500",   chainId: 11155111 },
  { id: "Base_Sepolia",       label: "Base Sepolia",      color: "bg-blue-400",    chainId: 84532 },
  { id: "Avalanche_Fuji",     label: "Avalanche Fuji",    color: "bg-red-500",     chainId: 43113 },
  { id: "Arbitrum_Sepolia",   label: "Arbitrum Sepolia",  color: "bg-sky-500",     chainId: 421614 },
  { id: "OP_Sepolia",         label: "OP Sepolia",        color: "bg-red-400",     chainId: 11155420 },
  { id: "Polygon_Amoy",       label: "Polygon Amoy",      color: "bg-purple-500",  chainId: 80002 },
];

const ChainSelector = ({
  value, onChange, label, exclude
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  exclude: string;
}) => {
  const [open, setOpen] = useState(false);
  const selected = CHAINS.find(c => c.id === value)!;

  return (
    <div className="relative">
      <div className="text-xs text-muted-foreground mb-2 font-medium">{label}</div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 rounded-2xl bg-secondary/50 border border-border/60 px-4 py-3 hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("h-8 w-8 rounded-full grid place-items-center text-white text-xs font-bold", selected.color)}>
            {selected.label.slice(0, 2)}
          </div>
          <span className="font-medium text-sm">{selected.label}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-card border border-border shadow-elev-lg z-50 overflow-hidden">
          {CHAINS.filter(c => c.id !== exclude).map(chain => (
            <button
              key={chain.id}
              onClick={() => { onChange(chain.id); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left",
                chain.id === value && "bg-primary-soft"
              )}
            >
              <div className={cn("h-7 w-7 rounded-full grid place-items-center text-white text-xs font-bold", chain.color)}>
                {chain.label.slice(0, 2)}
              </div>
              <span className="text-sm font-medium">{chain.label}</span>
              {chain.id === value && <span className="ml-auto text-xs text-primary font-semibold">Selected</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Bridge = () => {
  const [fromChain, setFromChain] = useState("Arc_Testnet");
  const [toChain, setToChain]     = useState("Base_Sepolia");
  const [amount, setAmount]       = useState("");
  const [bridging, setBridging]   = useState(false);
  const [txHash, setTxHash]       = useState<string | null>(null);

  const { isConnected, address } = useAccount();
  const { data: walletClient }   = useWalletClient({ chainId: ARC_TESTNET_CHAIN_ID });
  const publicClient             = usePublicClient({ chainId: ARC_TESTNET_CHAIN_ID });
  const { data: balance }        = useBalance({ address, chainId: ARC_TESTNET_CHAIN_ID, query: { enabled: Boolean(address) } });

  const amountNum = parseFloat(amount) || 0;
  const bal = balance ? parseFloat(balance.formatted) : 0;

  const flip = () => {
    setFromChain(toChain);
    setToChain(fromChain);
    setAmount("");
    setTxHash(null);
  };

  const handleBridge = async () => {
    if (!isConnected || !address)              { toast.error("Connect your wallet first"); return; }
    if (amountNum <= 0)                        { toast.error("Enter an amount"); return; }
    if (amountNum > bal)                       { toast.error("Insufficient balance"); return; }
    if (!walletClient || !publicClient)        { toast.error("Wallet not ready — make sure you are on Arc Testnet"); return; }

    setBridging(true);
    setTxHash(null);
    try {
      const adapter = await createViemAdapterFromWalletClient({
        walletClient,
        publicClient,
      });

      const kit = new AppKit();
      toast.info(`Bridging ${amount} USDC from ${fromChain} to ${toChain}...`);

      const result = await kit.bridge({
        from: { adapter, chain: fromChain as any },
        to:   { adapter, chain: toChain as any },
        amount,
      });

      const hash = result?.steps?.[result.steps.length - 1]?.txHash ?? "";
      setTxHash(hash);
      toast.success(`Bridged ${amount} USDC successfully!`, {
        description: hash ? `Tx: ${hash.slice(0, 10)}...` : "Check ArcScan for details",
      });
      setAmount("");
    } catch (e: any) {
      console.error(e);
      toast.error("Bridge failed", {
        description: e?.shortMessage ?? e?.message ?? "Unknown error",
      });
    } finally {
      setBridging(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container py-12 md:py-20">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow mb-5">
              <ArrowLeftRight className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Bridge USDC</h1>
            <p className="text-muted-foreground mt-3 max-w-sm mx-auto">
              Move USDC across chains instantly using Circle's CCTP protocol. Fast, secure, native.
            </p>
          </div>

          {/* Bridge card */}
          <div className="rounded-3xl bg-gradient-card border border-border shadow-elev-lg p-6">

            {/* From chain */}
            <ChainSelector
              label="From"
              value={fromChain}
              onChange={setFromChain}
              exclude={toChain}
            />

            {/* Amount */}
            <div className="mt-4 rounded-2xl bg-secondary/50 border border-border/60 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Amount (USDC)</span>
                {isConnected && (
                  <button onClick={() => setAmount(String(bal))} className="hover:text-foreground font-medium">
                    Balance: {bal.toFixed(4)} · <span className="text-primary">Max</span>
                  </button>
                )}
              </div>
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent outline-none text-3xl font-display font-semibold tracking-tight placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Flip button */}
            <div className="flex justify-center my-3">
              <button
                onClick={flip}
                className="h-10 w-10 rounded-xl bg-card border border-border grid place-items-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shadow-sm"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>

            {/* To chain */}
            <ChainSelector
              label="To"
              value={toChain}
              onChange={setToChain}
              exclude={fromChain}
            />

            {/* Info row */}
            {amountNum > 0 && (
              <div className="mt-4 rounded-2xl bg-primary-soft/60 border border-primary/10 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">You receive</span>
                  <span className="font-medium font-mono">~{amountNum.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protocol</span>
                  <span className="font-medium">Circle CCTP v2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. time</span>
                  <span className="font-medium">~20 seconds</span>
                </div>
              </div>
            )}

            {/* Bridge button */}
            <Button
              variant="hero"
              size="xl"
              className="w-full mt-4"
              onClick={handleBridge}
              disabled={bridging || !isConnected}
            >
              {bridging ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Bridging...</>
              ) : !isConnected ? "Connect wallet to bridge"
                : amountNum <= 0 ? "Enter an amount"
                : `Bridge ${amountNum > 0 ? amountNum + " USDC" : ""} →`}
            </Button>

            {/* Success state */}
            {txHash && (
              
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                View transaction on ArcScan <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Supported chains */}
          <div className="mt-6 rounded-2xl bg-card border border-border p-4">
            <div className="text-xs font-semibold text-muted-foreground mb-3">Supported testnet chains</div>
            <div className="flex flex-wrap gap-2">
              {CHAINS.map(chain => (
                <span key={chain.id} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  <div className={cn("h-2 w-2 rounded-full", chain.color)} />
                  {chain.label}
                </span>
              ))}
            </div>
          </div>

        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Bridge;