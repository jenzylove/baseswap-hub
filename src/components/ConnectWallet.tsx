import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useDisconnect, useSwitchChain } from "wagmi";
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { arcSepolia, baseSepolia } from "@/lib/chains";

const shorten = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export const ConnectWallet = ({ size = "default" }: { size?: "default" | "lg" }) => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <Button variant="hero" size={size} onClick={openConnectModal} disabled={!ready}>
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button variant="destructive" size={size} onClick={openChainModal}>
              <AlertTriangle className="h-4 w-4" />
              Wrong network
            </Button>
          );
        }

        return <ConnectedMenu address={account.address} chainId={chain.id} size={size} />;
      }}
    </ConnectButton.Custom>
  );
};

const ConnectedMenu = ({
  address,
  chainId,
  size,
}: {
  address: `0x${string}`;
  chainId: number;
  size: "default" | "lg";
}) => {
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const isArc = chainId === arcSepolia.id;
  const chainName = isArc ? "Arc Sepolia" : chainId === baseSepolia.id ? "Base Sepolia" : "Unknown";
  const explorer = isArc ? arcSepolia.blockExplorers.default.url : baseSepolia.blockExplorers.default.url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className="font-mono">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse-ring" />
          {shorten(address)}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Connected on</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning uppercase tracking-wider">
              Testnet
            </span>
          </div>
          <div className="font-semibold text-sm">{chainName}</div>
          <div className="font-mono text-xs text-muted-foreground mt-1">{shorten(address)}</div>
          <div className="mt-3 rounded-xl bg-secondary p-3">
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className="font-display text-lg font-semibold">
              {balance
                ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                : "—"}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Switch network
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="rounded-lg cursor-pointer"
          disabled={chainId === arcSepolia.id}
          onClick={() => switchChain({ chainId: arcSepolia.id })}
        >
          <span className="h-2 w-2 rounded-full bg-gradient-points" />
          Arc Sepolia
          {chainId === arcSepolia.id && <span className="ml-auto text-xs text-primary">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg cursor-pointer"
          disabled={chainId === baseSepolia.id}
          onClick={() => switchChain({ chainId: baseSepolia.id })}
        >
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Base Sepolia
          {chainId === baseSepolia.id && <span className="ml-auto text-xs text-primary">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="rounded-lg cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(address);
            toast.success("Address copied");
          }}
        >
          <Copy className="h-4 w-4" /> Copy address
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg cursor-pointer" asChild>
          <a href={`${explorer}/address/${address}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" /> View on explorer
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
