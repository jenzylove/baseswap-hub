import { ConnectWallet } from "./ConnectWallet";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useWallet } from "@/store/wallet";

const links = [
  { label: "Swap", href: "#swap" },
  { label: "Pools", href: "#pools" },
  { label: "Points", href: "#points" },
  { label: "Docs", href: "#docs" },
];

export const SiteHeader = () => {
  const points = useWallet((s) => s.points);
  const connected = useWallet((s) => s.connected);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-6">
        <a href="#" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-base tracking-tight">Starlight</span>
            <span className="text-[10px] font-medium text-muted-foreground -mt-0.5">DeFi on Base</span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {connected && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {points.toLocaleString()} pts
            </div>
          )}
          <ConnectWallet />
        </div>
      </div>
    </header>
  );
};
