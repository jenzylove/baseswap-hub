import { ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/store/wallet";

export const Hero = () => {
  const connected = useWallet((s) => s.connected);

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-primary/10 blur-3xl" aria-hidden />

      <div className="container relative pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 backdrop-blur px-4 py-1.5 text-xs font-semibold mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Live on <span className="text-primary">Arc</span> · Season 1 points are open
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
            Swap, earn, and farm <span className="bg-gradient-points bg-clip-text text-transparent">Starlight Points</span>
          </h1>

          <p className="mt-5 text-lg text-muted-foreground text-balance">
            The clean, fast home for stablecoin DeFi on Arc. Trade any token, deposit into 25% APR stable pools, and farm points every time you interact.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="hero" size="xl" asChild>
              <a href="#swap">
                {connected ? "Start trading" : "Launch app"} <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <a href="#pools">Explore pools</a>
            </Button>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
            {[
              { k: "$182M", v: "Total volume" },
              { k: "25%", v: "Stable pool APR" },
              { k: "48K", v: "Points farmers" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur px-3 py-4">
                <dt className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{s.k}</dt>
                <dd className="text-xs sm:text-sm text-muted-foreground mt-1">{s.v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Sub-second swaps</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> Audited smart pools</span>
            <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-primary" /> Points on every action</span>
          </div>
        </div>
      </div>
    </section>
  );
};
