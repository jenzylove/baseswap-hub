import { useState } from "react";
import { useAccount, useReadContract, useWalletClient, usePublicClient } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Droplets, Loader2, ExternalLink } from "lucide-react";
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

  return { reserveA, reserveB, tvl, poolSharePct, userValueA, userValueB, userShares: userShareNum, totalShares: totalShareNum };
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

      // Approve USDC
      toast.info("Step 1/3 — Approving USDC...");
      const approveTxA = await walletClient.writeContract({
        address: tokenA.address,
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [STARLIGHT_POOL_ADDRESS, amountAUnits],
        chain: walletClient.chain,
        account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTxA });

      // Approve EURC
      toast.info("Step 2/3 — Approving EURC...");
      const approveTxB = await walletClient.writeContract({
        address: tokenB.address,
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [STARLIGHT_POOL_ADDRESS, amountBUnits],
        chain: walletClient.chain,
        account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTxB });

      // Add liquidity
      toast.info("Step 3/3 — Adding liquidity...");
      const liquidityTx = await walletClient.writeContract({
        address: STARLIGHT_POOL_ADDRESS,
        abi: POOL_ABI,
        functionName: "addLiquidity",
        args: [amountAUnits, amountBUnits],
        chain: walletClient.chain,
        account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash: liquidityTx });

      toast.success("Liquidity added successfully!", {
        description: `View on ArcScan: testnet.arcscan.app/tx/${liquidityTx}`,
      });
      setAmountA("");
      setAmountB("");
      onClose();
    } catch (e: any) {
      toast.error("Deposit failed", {
        description: e?.shortMessage ?? e?.message ?? "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-1">
      <div className="rounded-2xl bg-secondary/50 border border-border/60 p-4 space-y-3">
        <div className="text-xs text-muted-foreground font-medium">USDC amount</div>
        <Input
          type="number"
          placeholder="0.0"
          value={amountA}
          onChange={(e) => setAmountA(e.target.value)}
          className="text-lg font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
        />
      </div>
      <div className="rounded-2xl bg-secondary/50 border border-border/60 p-4 space-y-3">
        <div className="text-xs text-muted-foreground font-medium">EURC amount</div>
        <Input
          type="number"
          placeholder="0.0"
          value={amountB}
          onChange={(e) => setAmountB(e.target.value)}
          className="text-lg font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        You'll receive pool shares proportional to your deposit. Earn 0.3% on every swap through this pool.
      </p>
      <Button
        variant="hero"
        size="lg"
        className="w-full"
        onClick={handleDeposit}
        disabled={loading || !isConnected}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
        ) : !isConnected ? "Connect wallet first" : "Deposit liquidity"}
      </Button>
    </div>
  );
};

export const PoolsSection = () => {
  const [depositOpen, setDepositOpen] = useState(false);
  const { reserveA, reserveB, tvl, poolSharePct, userValueA, userValueB } = usePoolData();
  const { isConnected } = useAccount();

  return (
    <section id="pools" className="container py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft text-accent px-3 py-1 text-xs font-semibold mb-3">
            <TrendingUp className="h-3.5 w-3.5" />
            Live on Arc Testnet
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Liquidity pools</h2>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Deposit into the Starlight USDC/EURC pool and earn 0.3% on every swap. Your share grows with every trade.
          </p>
        </div>
      </div>

      {/* Pool Card */}
      <div className="rounded-3xl bg-gradient-card border border-border p-6 shadow-elev-lg mb-6">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              <TokenChip symbol="USDC" />
              <TokenChip symbol="EURC" />
            </div>
            <div>
              <div className="font-display font-semibold text-lg">USDC / EURC</div>
              <div className="text-xs text-muted-foreground mt-0.5">Starlight AMM · 0.3% fee</div>
            </div>
          </div>
          
            href={`https://testnet.arcscan.app/address/${STARLIGHT_POOL_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View contract <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Real pool stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl bg-secondary/50 p-4">
            <div className="text-xs text-muted-foreground mb-1">TVL</div>
            <div className="font-display font-bold text-xl">
              ${tvl > 0 ? tvl.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
            </div>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-4">
            <div className="text-xs text-muted-foreground mb-1">USDC reserve</div>
            <div className="font-display font-bold text-xl">
              {reserveA > 0 ? reserveA.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
            </div>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-4">
            <div className="text-xs text-muted-foreground mb-1">EURC reserve</div>
            <div className="font-display font-bold text-xl">
              {reserveB > 0 ? reserveB.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
            </div>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-4">
            <div className="text-xs text-muted-foreground mb-1">Fee</div>
            <div className="font-display font-bold text-xl">0.3%</div>
          </div>
        </div>

        {/* User position */}
        {isConnected && poolSharePct > 0 && (
          <div className="rounded-2xl bg-primary-soft/60 border border-primary/10 p-4 mb-4">
            <div className="text-xs font-semibold text-primary mb-2">Your position</div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Pool share</div>
                <div className="font-bold">{poolSharePct.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">USDC value</div>
                <div className="font-bold">{userValueA.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">EURC value</div>
                <div className="font-bold">{userValueB.toFixed(4)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs mb-4">
          <span className="text-muted-foreground">Rewards</span>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">0.3% swap fees</span>
            <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 font-semibold inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Points
            </span>
          </div>
        </div>

        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
          <DialogTrigger asChild>
            <Button variant="soft" className="w-full">
              <Droplets className="h-4 w-4" />
              Deposit liquidity
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
    </section>
  );
};