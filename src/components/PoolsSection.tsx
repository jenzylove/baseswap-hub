import { useState } from "react";
import { useAccount, useReadContract, useWalletClient, usePublicClient } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Droplets, Loader2, ExternalLink, MinusCircle } from "lucide-react";
import { findToken, ARC_TESTNET_CHAIN_ID, STARLIGHT_POOL_ADDRESS, POOL_ABI } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ERC20_APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

const TokenChip = ({ symbol }: { symbol: string }) => {
  const t = findToken(symbol);
  return (
    <span className={cn("h-8 w-8 rounded-full ring-2 ring-card grid place-items-center text-[10px] font-bold", t.chip)}>
      {t.symbol.slice(0, 2)}
    </span>
  );
};

const usePoolData = () => {
  const { address } = useAccount();

  const { data: reserves } = useReadContract({
    address: STARLIGHT_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "getReserves",
    chainId: ARC_TESTNET_CHAIN_ID,
  });

  const { data: totalShares } = useReadContract({
    address: STARLIGHT_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "totalShares",
    chainId: ARC_TESTNET_CHAIN_ID,
  });

  const { data: userShares } = useReadContract({
    address: STARLIGHT_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: "shares",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  const reserveA = reserves ? parseFloat(formatUnits(reserves[0], 6)) : 0;
  const reserveB = reserves ? parseFloat(formatUnits(reserves[1], 6)) : 0;
  const tvl = reserveA + reserveB;
  const userShareNum = userShares ? Number(userShares) : 0;
  const totalShareNum = totalShares ? Number(totalShares) : 0;
  const poolSharePct = totalShareNum > 0 ? (userShareNum / totalShareNum) * 100 : 0;
  const userValueA = poolSharePct > 0 ? (reserveA * poolSharePct) / 100 : 0;
  const userValueB = poolSharePct > 0 ? (reserveB * poolSharePct) / 100 : 0;

  return { reserveA, reserveB, tvl, poolSharePct, userValueA, userValueB, userShareNum };
};

const DepositModal = ({ onClose }: { onClose: () => void }) => {
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId: ARC_TESTNET_CHAIN_ID });
  const publicClient = usePublicClient({ chainId: ARC_TESTNET_CHAIN_ID });
  const tokenA = findToken("USDC");
  const tokenB = findToken("EURC");

  const handleDeposit = async () => {
    if (!isConnected || !address || !walletClient || !publicClient) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      toast.error("Enter amounts for both tokens");
      return;
    }
    setLoading(true);
    try {
      const amountAUnits = parseUnits(amountA, tokenA.decimals);
      const amountBUnits = parseUnits(amountB, tokenB.decimals);

      toast.info("Step 1/3 — Approving USDC...");
      const approveTxA = await walletClient.writeContract({
        address: tokenA.address, abi: ERC20_APPROVE_ABI, functionName: "approve",
        args: [STARLIGHT_POOL_ADDRESS, amountAUnits], chain: walletClient.chain, account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTxA, timeout: 60_000, pollingInterval: 2_000 });

      toast.info("Step 2/3 — Approving EURC...");
      const approveTxB = await walletClient.writeContract({
        address: tokenB.address, abi: ERC20_APPROVE_ABI, functionName: "approve",
        args: [STARLIGHT_POOL_ADDRESS, amountBUnits], chain: walletClient.chain, account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTxB, timeout: 60_000, pollingInterval: 2_000 });

      toast.info("Step 3/3 — Adding liquidity...");
      const liquidityTx = await walletClient.writeContract({
        address: STARLIGHT_POOL_ADDRESS, abi: POOL_ABI, functionName: "addLiquidity",
        args: [amountAUnits, amountBUnits], chain: walletClient.chain, account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash: liquidityTx, timeout: 60_000, pollingInterval: 2_000 });

      toast.success("Liquidity added!", {
        description: `testnet.arcscan.app/tx/${liquidityTx}`,
      });
      setAmountA(""); setAmountB(""); onClose();
    } catch (e: any) {
      toast.error("Deposit failed", { description: e?.shortMessage ?? e?.message ?? "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-1">
      <div className="rounded-2xl bg-secondary/50 border border-border/60 p-4">
        <div className="text-xs text-muted-foreground mb-2">USDC amount</div>
        <Input type="number" placeholder="0.0" value={amountA} onChange={(e) => setAmountA(e.target.value)}
          className="text-lg font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0" />
      </div>
      <div className="rounded-2xl bg-secondary/50 border border-border/60 p-4">
        <div className="text-xs text-muted-foreground mb-2">EURC amount</div>
        <Input type="number" placeholder="0.0" value={amountB} onChange={(e) => setAmountB(e.target.value)}
          className="text-lg font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0" />
      </div>
      <p className="text-xs text-muted-foreground">Earn 0.3% on every swap. Withdraw anytime.</p>
      <Button variant="hero" size="lg" className="w-full" onClick={handleDeposit} disabled={loading || !isConnected}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : !isConnected ? "Connect wallet first" : "Deposit liquidity"}
      </Button>
    </div>
  );
};

// ── NEW: Withdraw Modal ──────────────────────────────────────────────────────
const WithdrawModal = ({ userShareNum, userValueA, userValueB, onClose }: {
  userShareNum: number;
  userValueA: number;
  userValueB: number;
  onClose: () => void;
}) => {
  const [pct, setPct] = useState("100");
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId: ARC_TESTNET_CHAIN_ID });
  const publicClient = usePublicClient({ chainId: ARC_TESTNET_CHAIN_ID });

  const pctNum = Math.min(100, Math.max(0, parseFloat(pct) || 0));
  const sharesToBurn = Math.floor((userShareNum * pctNum) / 100);
  const willReceiveA = (userValueA * pctNum) / 100;
  const willReceiveB = (userValueB * pctNum) / 100;

  const handleWithdraw = async () => {
    if (!isConnected || !address || !walletClient || !publicClient) {
      toast.error("Connect your wallet first");
      return;
    }
    if (sharesToBurn <= 0) {
      toast.error("Enter a percentage to withdraw");
      return;
    }
    setLoading(true);
    try {
      toast.info("Withdrawing liquidity...");
      const withdrawTx = await walletClient.writeContract({
        address: STARLIGHT_POOL_ADDRESS,
        abi: POOL_ABI,
        functionName: "removeLiquidity",
        args: [BigInt(sharesToBurn)],
        chain: walletClient.chain,
        account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash: withdrawTx, timeout: 60_000, pollingInterval: 2_000 });

      toast.success("Liquidity withdrawn!", {
        description: `testnet.arcscan.app/tx/${withdrawTx}`,
      });
      onClose();
    } catch (e: any) {
      toast.error("Withdrawal failed", { description: e?.shortMessage ?? e?.message ?? "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-1">
      {/* Percentage input */}
      <div className="rounded-2xl bg-secondary/50 border border-border/60 p-4">
        <div className="text-xs text-muted-foreground mb-2">Amount to withdraw (%)</div>
        <div className="flex items-center gap-3">
          <Input
            type="number" placeholder="100" value={pct}
            onChange={(e) => setPct(e.target.value)}
            min="1" max="100"
            className="text-lg font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
          />
          <span className="text-lg font-semibold text-muted-foreground">%</span>
        </div>
        {/* Quick select buttons */}
        <div className="flex gap-2 mt-3">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => setPct(String(p))}
              className={cn(
                "flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-colors",
                pctNum === p
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary border-border hover:bg-secondary/70"
              )}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {/* You will receive */}
      {pctNum > 0 && (
        <div className="rounded-2xl bg-primary-soft/60 border border-primary/10 p-3 text-xs space-y-1.5">
          <div className="font-semibold text-primary mb-1">You will receive</div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">USDC</span>
            <span className="font-bold font-mono">~{willReceiveA.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">EURC</span>
            <span className="font-bold font-mono">~{willReceiveB.toFixed(4)}</span>
          </div>
        </div>
      )}

      <Button
        variant="hero" size="lg" className="w-full"
        onClick={handleWithdraw}
        disabled={loading || !isConnected || pctNum <= 0}
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Withdrawing...</>
          : !isConnected ? "Connect wallet first"
          : `Withdraw ${pctNum}%`}
      </Button>
    </div>
  );
};

export const PoolsSection = () => {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const { reserveA, reserveB, tvl, poolSharePct, userValueA, userValueB, userShareNum } = usePoolData();
  const { isConnected } = useAccount();

  return (
    <section id="pools" className="container py-20">

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft text-accent px-3 py-1 text-xs font-semibold mb-3">
          <TrendingUp className="h-3.5 w-3.5" />
          Live on Arc Testnet
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Liquidity pools</h2>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Deposit into the USDC/EURC pool, earn 0.3% on every swap, and farm Starlight Points.
        </p>
      </div>

      {/* Pool Card */}
      <div className="rounded-3xl bg-gradient-card border border-border shadow-card overflow-hidden">

        {/* Pool header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              <TokenChip symbol="USDC" />
              <TokenChip symbol="EURC" />
            </div>
            <div>
              <div className="font-display font-semibold">USDC / EURC</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0 bg-accent-soft text-accent border-0">Stable</Badge>
                <Badge className="rounded-full text-[10px] px-2 py-0 bg-primary-soft text-primary border-0 hover:bg-primary-soft">Live</Badge>
              </div>
            </div>
          </div>
          <a href={`https://testnet.arcscan.app/address/${STARLIGHT_POOL_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
            Contract <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          <div className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">TVL</div>
            <div className="font-display font-bold text-lg">${tvl > 0 ? tvl.toFixed(2) : "—"}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">USDC</div>
            <div className="font-display font-bold text-lg">{reserveA > 0 ? reserveA.toFixed(2) : "—"}</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-xs text-muted-foreground mb-1">EURC</div>
            <div className="font-display font-bold text-lg">{reserveB > 0 ? reserveB.toFixed(2) : "—"}</div>
          </div>
        </div>

        {/* Your position */}
        {isConnected && poolSharePct > 0 && (
          <div className="px-5 py-4 bg-primary-soft/40 border-b border-border">
            <div className="text-xs font-semibold text-primary mb-2">Your position</div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Share </span>
                <span className="font-bold">{poolSharePct.toFixed(2)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">USDC </span>
                <span className="font-bold">{userValueA.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">EURC </span>
                <span className="font-bold">{userValueB.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">0.3% fee</span>
            <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 font-medium inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Points
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Withdraw button — only shows if user has shares */}
            {isConnected && poolSharePct > 0 && (
              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MinusCircle className="h-4 w-4" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Withdraw from USDC / EURC pool</DialogTitle>
                  </DialogHeader>
                  <WithdrawModal
                    userShareNum={userShareNum}
                    userValueA={userValueA}
                    userValueB={userValueB}
                    onClose={() => setWithdrawOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}

            {/* Deposit button */}
            <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
              <DialogTrigger asChild>
                <Button variant="soft" size="sm">
                  <Droplets className="h-4 w-4" />
                  Deposit
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Deposit into USDC / EURC pool</DialogTitle>
                </DialogHeader>
                <DepositModal onClose={() => setDepositOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

      </div>
    </section>
  );
};