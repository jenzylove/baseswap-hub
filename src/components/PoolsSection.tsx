import { useMemo, useState } from "react";
import { POOLS, Pool, formatUsd, formatApr } from "@/lib/pools";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, Droplets, Rocket } from "lucide-react";
import { findToken } from "@/lib/tokens";
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
  const isStable = ["USDC", "USDT", "DAI", "PYUSD", "EURC"].every &&
    [a, b].every((s) => ["USDC", "USDT", "DAI", "PYUSD", "EURC"].includes(s));
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
              <Badge className="rounded-full text-[10px] px-2 py-0 bg-primary-soft text-primary border-0 hover:bg-primary-soft">Coming soon</Badge>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">APR</div>
          <div className="font-display text-2xl font-bold text-muted-foreground">{formatApr(pool.apr)}</div>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">TVL</dt>
          <dd className="font-mono font-semibold text-muted-foreground">{formatUsd(pool.tvlUsd)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">24h Volume</dt>
          <dd className="font-mono font-semibold text-muted-foreground">{formatUsd(pool.volume24h)}</dd>
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
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const stables = ["USDC", "USDT", "DAI", "PYUSD", "EURC"];
    if (tab === "stable") return POOLS.filter((p) => p.pair.every((s) => stables.includes(s)));
    if (tab === "volatile") return POOLS.filter((p) => ["WETH", "WBTC", "ARC"].some((s) => p.pair.includes(s)));
    return POOLS;
  }, [tab]);

  const handleDeposit = (_pool: Pool) => {
    toast("Pool contracts deploying soon — check back shortly");
  };

  return (
    <section id="pools" className="container py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-soft text-accent px-3 py-1 text-xs font-semibold mb-3">
            <TrendingUp className="h-3.5 w-3.5" />
            Early LP rewards on Arc
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Liquidity pools</h2>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Deposit into curated, audited pools and earn trading fees, partner rewards, and Starlight Points — all at once.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="rounded-full bg-secondary p-1 h-11">
            <TabsTrigger value="all" className="rounded-full px-5 data-[state=active]:bg-card data-[state=active]:shadow-sm">All</TabsTrigger>
            <TabsTrigger value="stable" className="rounded-full px-5 data-[state=active]:bg-card data-[state=active]:shadow-sm">Stable</TabsTrigger>
            <TabsTrigger value="volatile" className="rounded-full px-5 data-[state=active]:bg-card data-[state=active]:shadow-sm">Volatile</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-2xl bg-primary-soft/60 border border-primary/10 p-4 flex items-start gap-3 mb-8">
        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
          <Rocket className="h-4 w-4" />
        </div>
        <div className="text-sm">
          <div className="font-semibold text-foreground">Liquidity pools launching soon on Arc Testnet.</div>
          <div className="text-muted-foreground">Be an early liquidity provider — pre-register your interest and earn bonus Starlight Points at launch.</div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
          No pools in this category yet. Check the <button className="text-primary font-semibold underline-offset-2 hover:underline" onClick={() => setTab("all")}>All</button> tab.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PoolCard key={p.id} pool={p} onDeposit={handleDeposit} />
          ))}
        </div>
      )}
    </section>
  );
};
