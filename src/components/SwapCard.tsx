import { useMemo, useState } from "react";
import { ArrowDown, Settings2, Sparkles, ChevronDown, Search, Loader2 } from "lucide-react";
import { useAccount, useBalance, useWalletClient, useWriteContract, usePublicClient } from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TOKENS, Token, findToken, ARC_TESTNET_CHAIN_ID } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3" as `0x${string}`;
const STABLEFX_ADDRESS = "0x867650F5eAe8df91445971f14d89fd84F0C9a9f8" as `0x${string}`;

const ERC20_ABI = [
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
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

const useTokenBalance = (token: Token) => {
  const { address } = useAccount();
  const { data } = useBalance({
    address,
    token: token.address,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });
  return data ? parseFloat(data.formatted) : 0;
};

const TokenButton = ({ token, onPick }: { token: Token; onPick: (t: Token) => void }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { address } = useAccount();

  const filtered = useMemo(
    () =>
      TOKENS.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q.toLowerCase()) ||
          t.name.toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-secondary hover:bg-secondary/70 transition-colors pl-1 pr-3 py-1 font-semibold"
        >
          <span className={cn("h-7 w-7 rounded-full grid place-items-center text-[11px] font-bold", token.chip)}>
            {token.symbol.slice(0, 2)}
          </span>
          <span className="text-sm">{token.symbol}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or paste address"
              className="pl-9 rounded-xl h-11"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto pb-3">
          {filtered.map((t) => (
            <TokenRow
              key={t.symbol}
              token={t}
              connected={Boolean(address)}
              onPick={() => { onPick(t); setOpen(false); setQ(""); }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TokenRow = ({ token, connected, onPick }: { token: Token; connected: boolean; onPick: () => void }) => {
  const balance = useTokenBalance(token);
  return (
    <button
      onClick={onPick}
      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary text-left transition-colors"
    >
      <span className={cn("h-9 w-9 rounded-full grid place-items-center text-xs font-bold", token.chip)}>
        {token.symbol.slice(0, 2)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{token.symbol}</div>
        <div className="text-xs text-muted-foreground truncate">{token.name}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-mono">
          {connected ? balance.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.00"}
        </div>
      </div>
    </button>
  );
};

export const SwapCard = () => {
  const [fromSym, setFromSym] = useState("USDC");
  const [toSym, setToSym] = useState("EURC");
  const [amount, setAmount] = useState("");
  const [swapping, setSwapping] = useState(false);

  const from = findToken(fromSym);
  const to = findToken(toSym);

  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId: ARC_TESTNET_CHAIN_ID });
  const publicClient = usePublicClient({ chainId: ARC_TESTNET_CHAIN_ID });
  const fromBalance = useTokenBalance(from);
  const toBalance = useTokenBalance(to);

  const amountNum = parseFloat(amount) || 0;
  const usdValue = amountNum * from.usd;
  const out = usdValue ? (usdValue * 0.997) / to.usd : 0;
  const pointsEarn = Math.max(0, Math.round(usdValue));

  const flip = () => { setFromSym(toSym); setToSym(fromSym); setAmount(""); };
  const setMax = () => setAmount(String(fromBalance));

  const handleSwap = async () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet to swap");
      return;
    }
    if (amountNum <= 0) {
      toast.error("Enter an amount");
      return;
    }
    if (amountNum > fromBalance) {
      toast.error("Insufficient balance");
      return;
    }
    if (!walletClient || !publicClient) {
      toast.error("Wallet not ready — make sure you are on Arc Testnet");
      return;
    }

    setSwapping(true);
    try {
      const amountInUnits = parseUnits(amount, from.decimals);

      // Step 1 — Approve Permit2 to spend your token
      toast.info("Step 1/2 — Approving token spend...");
      const approveTx = await walletClient.writeContract({
        address: from.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [PERMIT2_ADDRESS, amountInUnits],
        chain: walletClient.chain,
        account: address,
      });
      await publicClient.waitForTransactionReceipt({ hash: approveTx });

      // Step 2 — Execute swap via StableFX
      toast.info("Step 2/2 — Executing swap...");
      const swapTx = await walletClient.writeContract({
        address: STABLEFX_ADDRESS,
        abi: [
          {
            name: "swap",
            type: "function",
            inputs: [
              { name: "tokenIn", type: "address" },
              { name: "tokenOut", type: "address" },
              { name: "amountIn", type: "uint256" },
              { name: "minAmountOut", type: "uint256" },
              { name: "recipient", type: "address" },
            ],
            outputs: [{ name: "amountOut", type: "uint256" }],
            stateMutability: "nonpayable",
          },
        ],
        functionName: "swap",
        args: [
          from.address,
          to.address,
          amountInUnits,
          parseUnits((out * 0.99).toFixed(6), to.decimals), // 1% slippage
          address,
        ],
        chain: walletClient.chain,
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash: swapTx });

      toast.success(`Swapped ${amount} ${fromSym} → ${to.symbol}!`, {
        description: `View on ArcScan: testnet.arcscan.app/tx/${swapTx}`,
      });
      setAmount("");

    } catch (e: any) {
      console.error(e);
      toast.error("Swap failed", {
        description: e?.shortMessage ?? e?.message ?? "Unknown error",
      });
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl bg-gradient-card border border-border shadow-elev-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold">Swap</h3>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-2xl bg-secondary/50 border border-border/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>You pay</span>
            <button onClick={setMax} className="font-medium hover:text-foreground">
              Balance: {isConnected ? fromBalance.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.00"} · <span className="text-primary">Max</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent outline-none text-3xl font-display font-semibold tracking-tight placeholder:text-muted-foreground/50 min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <TokenButton token={from} onPick={(t) => setFromSym(t.symbol)} />
          </div>
          <div className="text-xs text-muted-foreground mt-2 h-4">
            {usdValue > 0 && `$${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          </div>
        </div>

        <div className="relative h-0">
          <button
            onClick={flip}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-card border-4 border-background grid place-items-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-elev-md"
            aria-label="Flip tokens"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-secondary/50 border border-border/60 p-4 mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>You receive</span>
            <span>Balance: {isConnected ? toBalance.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.00"}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-3xl font-display font-semibold tracking-tight text-foreground/80 min-w-0 truncate">
              {out > 0 ? out.toLocaleString(undefined, { maximumFractionDigits: 6 }) : "0.0"}
            </div>
            <TokenButton token={to} onPick={(t) => setToSym(t.symbol)} />
          </div>
          <div className="text-xs text-muted-foreground mt-2 h-4">
            {out > 0 && `$${(out * to.usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          </div>
        </div>

        {amountNum > 0 && (
          <div className="mt-4 rounded-2xl bg-primary-soft/60 border border-primary/10 p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-medium font-mono">1 {from.symbol} ≈ {(from.usd / to.usd).toLocaleString(undefined, { maximumFractionDigits: 6 })} {to.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network fee</span>
              <span className="font-medium">~0.01 USDC on Arc</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slippage</span>
              <span className="font-medium">1%</span>
            </div>
            <div className="flex justify-between border-t border-primary/10 pt-1.5 mt-1.5">
              <span className="text-primary font-semibold inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Points earned
              </span>
              <span className="font-bold text-primary">+{pointsEarn.toLocaleString()} pts</span>
            </div>
          </div>
        )}

        <Button
          variant="hero"
          size="xl"
          className="w-full mt-4"
          onClick={handleSwap}
          disabled={swapping}
        >
          {swapping ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Swapping…</>
          ) : !isConnected ? (
            "Connect wallet to swap"
          ) : amountNum <= 0 ? (
            "Enter an amount"
          ) : amountNum > fromBalance ? (
            "Insufficient balance"
          ) : (
            `Swap ${fromSym} → ${toSym}`
          )}
        </Button>
      </div>
    </div>
  );
};