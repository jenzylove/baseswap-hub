import { useMemo, useState } from "react";
import { POOLS, Pool, formatUsd, formatNum } from "@/lib/pools";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, Loader2, Droplets } from "lucide-react";
import { findToken } from "@/lib/tokens";
import { useWallet } from "@/store/wallet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TokenChip = ({ symbol }: { symbol: string }) => {
  const t = findToken(symbol);
  return (
    <span className={cn("h-8 w-8 rounded-full ring-2 ring-card grid place-items-center text-[10px] font-bold", t.chip)}>
      {t.symbol.slice(0, 2)}
    </span>
  );
};

const PoolCard = ({ pool, onDeposit }: { pool: Pool; onDeposit: (p: Pool) => void }) => {
  const [a, b] = pool.pair;
  const isStable = pool.apr <= 30 && [a, b].every((s) => ["USDC", "USDT", "DAI", "PYUSD", "EURC"].includes(s));
  return (
    <div className={cn(
      "group rounded-3xl bg-gradient-card border border-border p-5 shadow-card hover:shadow-elev-lg transition-all hover:-translate-y-0.5",
      pool.featured && "ring-2 ring-primary/20"
    )}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-3">
            <TokenChip symbol={a} />
            <TokenChip symbol={b} />
          </div>
          <div>
            <div className="font-display font-semibold text-base">{a} / {b}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isStable && <Badge variant="secondary" className="rounded-full text-[10px] px-2 py-0 bg-accent-soft text-accent border-0">Stable</Badge>}
              {pool.featured && <Badge className="rounded-full text-[10px] px-2 py-0 bg-primary-soft text-primary border-0 hover:bg-primary-soft">Featured</Badge>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">APR</div>
          <div className="font-display text-2xl font-bold text-accent">{pool.apr.toFixed(1)}%</div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">TVL</dt>
          <dd className="font-mono font-semibold">{formatUsd(pool.tvlUsd)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">24h Volume</dt>
          <dd className="font-mono font-semibold">{formatUsd(pool.volume24h)}</dd>
        </div>
      </dl>

      <div className="flex items-center justify-between text-xs mb-4">
        <span className="text-muted-foreground">Rewards</span>
        <div className="flex items-center gap-1">
          {pool.rewardTokens.map((r) => (
            <span key={r} className="rounded-full bg-secondary px-2 py-0.5 font-semibold">{r}</span>
          ))}
          <span className="rounded-full bg-primary-soft text-primary px-2 py-0.5 font-semibold inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Points
          </span>
        </div>
      </div>

      <Button variant="soft" className="w-full" onClick={() => onDeposit(pool)}>
        <Droplets className="h-4 w-4" />
        Deposit liquidity
      </Button>
    </div>
  );
};

export const PoolsSection = () => {
  const [tab, setTab] = useState("stable");
  const [active, setActive] = useState<Pool | null>(null);
  const [amount, setAmount] = useState("");
  const [depositing, setDepositing] = useState(false);

  const { connected, addPoints } = useWallet();

  const filtered = useMemo(() => {
    const stables = ["USDC", "USDT", "DAI", "PYUSD", "EURC"];
    if (tab === "stable")
      return POOLS.filter((p) => p.pair.every((s) => stables.includes(s)) && p.apr <= 30);
    if (tab === "volatile") return POOLS.filter((p) => p.apr > 30 || ["WETH", "WBTC", "ARC"].some((s) => p.pair.includes(s)));
    return POOLS;
  }, [tab]);

  const sorted = [...filtered].sort((a, b) => b.apr - a.apr);

  const handleDeposit = () => {
    const amt = parseFloat(amount) || 0;
    if (!connected) {
      toast.error("Connect your wallet first");
      return;
    }
    if (amt <= 0) {
      toast.error("Enter an amount");
      return;
    }
    setDepositing(true);
    setTimeout(() => {
      const points = Math.round(amt * 5); // 5 pts per $1 deposited
      addPoints(points);
      setDepositing(false);
      setActive(null);
      setAmount("");
      toast.success(`Deposited $${amt.toLocaleString()} into ${active!.pair.join("/")}`, {
        description: `Earning ${active!.apr.toFixed(1)}% APR · +${points} Starlight Points`,
      });
    }, 900);
  };

  return (
    <section id="pools" className="container py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft text-accent px-3 py-1 text-xs font-semibold mb-3">
            <TrendingUp className="h-3.5 w-3.5" />
            Up to 25% APR on stables
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Liquidity pools</h2>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Deposit into curated, audited pools and earn trading fees, partner rewards, and Starlight Points — all at once.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="rounded-full bg-secondary p-1 h-11">
            <TabsTrigger value="stable" className="rounded-full px-5 data-[state=active]:bg-card data-[state=active]:shadow-sm">Stable</TabsTrigger>
            <TabsTrigger value="volatile" className="rounded-full px-5 data-[state=active]:bg-card data-[state=active]:shadow-sm">Volatile</TabsTrigger>
            <TabsTrigger value="all" className="rounded-full px-5 data-[state=active]:bg-card data-[state=active]:shadow-sm">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((p) => (
          <PoolCard key={p.id} pool={p} onDeposit={setActive} />
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-3">
                  <div className="flex -space-x-3">
                    <TokenChip symbol={active.pair[0]} />
                    <TokenChip symbol={active.pair[1]} />
                  </div>
                  Deposit {active.pair.join(" / ")}
                </DialogTitle>
              </DialogHeader>

              <div className="rounded-2xl bg-secondary/50 border border-border/60 p-4 mt-2">
                <div className="text-xs text-muted-foreground mb-2">Deposit amount (USD)</div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-2xl font-semibold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent outline-none text-3xl font-display font-semibold min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  {[100, 500, 1000, 5000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className="flex-1 rounded-full bg-card hover:bg-primary-soft border border-border text-xs font-semibold py-1.5 transition-colors"
                    >
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-primary-soft/60 border border-primary/10 p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">APR</span>
                  <span className="font-semibold text-accent">{active.apr.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. yearly yield</span>
                  <span className="font-mono font-semibold">
                    {amount ? `$${((parseFloat(amount) || 0) * active.apr / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-primary/10 pt-2">
                  <span className="text-primary font-semibold inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Points (instant)
                  </span>
                  <span className="font-bold text-primary">
                    +{Math.round((parseFloat(amount) || 0) * 5).toLocaleString()} pts
                  </span>
                </div>
              </div>

              <Button variant="hero" size="lg" className="w-full" disabled={depositing} onClick={handleDeposit}>
                {depositing ? <><Loader2 className="h-4 w-4 animate-spin" /> Depositing…</> : "Confirm deposit"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
