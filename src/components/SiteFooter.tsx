import { Sparkles, Github, Twitter, MessageCircle } from "lucide-react";

export const SiteFooter = () => (
  <footer className="border-t border-border bg-background">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <div className="font-display font-bold text-sm">Starlight</div>
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} · Built on Base</div>
        </div>
      </div>

      <nav className="flex items-center gap-5 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">Docs</a>
        <a href="#" className="hover:text-foreground transition-colors">Audit</a>
        <a href="#" className="hover:text-foreground transition-colors">Brand</a>
        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
      </nav>

      <div className="flex items-center gap-2">
        <a href="#" aria-label="Twitter" className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary transition-colors">
          <Twitter className="h-4 w-4" />
        </a>
        <a href="#" aria-label="Discord" className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary transition-colors">
          <MessageCircle className="h-4 w-4" />
        </a>
        <a href="#" aria-label="GitHub" className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary transition-colors">
          <Github className="h-4 w-4" />
        </a>
      </div>
    </div>
  </footer>
);
