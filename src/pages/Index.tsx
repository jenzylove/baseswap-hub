import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { SwapCard } from "@/components/SwapCard";
import { PoolsSection } from "@/components/PoolsSection";
import { PointsDashboard } from "@/components/PointsDashboard";
import { SiteFooter } from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />

        {/* Swap section */}
        <section id="swap" className="container py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft text-primary px-3 py-1 text-xs font-semibold mb-3">
                Best execution on Base
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-balance">
                Swap any token in one tap
              </h2>
              <p className="text-muted-foreground mt-3 max-w-md">
                Starlight routes through every major DEX on Base to find you the best price — at fees that round to a penny.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Aggregated routing across 14+ DEXes",
                  "Sub-second quotes, sub-second confirmations",
                  "Earn 1 Starlight Point for every $1 swapped",
                ].map((s) => (
                  <li key={s} className="flex items-start gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="text-foreground/80">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <SwapCard />
            </div>
          </div>
        </section>

        <PoolsSection />
        <PointsDashboard />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
