import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink } from "lucide-react";
import { useWallet } from "@/store/wallet";
import { toast } from "sonner";

const shorten = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export const ConnectWallet = ({ size = "default" }: { size?: "default" | "lg" }) => {
  const { connected, address, ethBalance, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = (provider: string) => {
    setOpen(false);
    setConnecting(true);
    setTimeout(() => {
      connect();
      setConnecting(false);
      toast.success(`Connected with ${provider}`, {
        description: "Wallet linked on Arc. Read-only mode.",
      });
    }, 700);
  };

  if (!connected) {
    return (
      <>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="hero" size={size} disabled={connecting}>
              <Wallet className="h-4 w-4" />
              {connecting ? "Connecting…" : "Connect Wallet"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
            <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-muted-foreground">
              Connect on Arc
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="rounded-xl px-3 py-3 cursor-pointer"
              onClick={() => handleConnect("MetaMask")}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 grid place-items-center text-white font-bold text-xs">
                M
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">MetaMask</div>
                <div className="text-xs text-muted-foreground">Browser wallet</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl px-3 py-3 cursor-pointer"
              onClick={() => handleConnect("Coinbase Wallet")}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center text-white font-bold text-xs">
                C
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Coinbase Wallet</div>
                <div className="text-xs text-muted-foreground">Stablecoin-friendly</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-xl px-3 py-3 cursor-pointer"
              onClick={() => handleConnect("WalletConnect")}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 grid place-items-center text-white font-bold text-xs">
                W
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">WalletConnect</div>
                <div className="text-xs text-muted-foreground">300+ wallets</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className="font-mono">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse-ring" />
          {shorten(address!)}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2">
        <div className="px-3 py-3">
          <div className="text-xs text-muted-foreground mb-1">Connected on Arc</div>
          <div className="font-mono text-sm font-semibold">{shorten(address!)}</div>
          <div className="mt-3 rounded-xl bg-secondary p-3">
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className="font-display text-lg font-semibold">{ethBalance.toFixed(4)} ETH</div>
            <div className="text-xs text-muted-foreground">≈ ${(ethBalance * 3450).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="rounded-lg cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(address!);
            toast.success("Address copied");
          }}
        >
          <Copy className="h-4 w-4" /> Copy address
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg cursor-pointer" asChild>
          <a href={`https://explorer.arc.network/address/${address}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" /> View on Arc Explorer
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
          onClick={() => {
            disconnect();
            toast("Disconnected");
          }}
        >
          <LogOut className="h-4 w-4" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
