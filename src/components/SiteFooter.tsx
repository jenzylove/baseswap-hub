import { Sparkles, Github, Twitter } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ComingSoon = ({ label }: { label: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        aria-disabled="true"
        className="cursor-not-allowed opacity-50 select-none"
      >
        {label}
      </span>
    </TooltipTrigger>
    <TooltipContent>Coming soon</TooltipContent>
  </Tooltip>
);

export const SiteFooter = () => (
  <footer className="border-t border-border bg-background">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="font-display font-bold text-sm">Starlight</div>
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} · Built on Arc</div>
        </div>
      </div>

      <nav className="flex items-center gap-5 text-sm text-muted-foreground">
        <a
          href="https://docs.arc.network"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Docs
        </a>
        <ComingSoon label="Audit" />
      </nav>

      <div className="flex items-center gap-2">
        <a
          href="https://x.com/Dollar782"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary transition-colors"
        >
          <Twitter className="h-4 w-4" />
        </a>
        <a
          href="https://github.com/jenzylove/baseswap-hub"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary transition-colors"
        >
          <Github className="h-4 w-4" />
        </a>
      </div>
    </div>
  </footer>
);
