import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid hydration flash — render a stable placeholder until mounted.
  const Icon = !mounted ? Sun : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Toggle theme">
          <Icon className="h-4 w-4 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl p-1.5 min-w-36">
        <DropdownMenuItem
          className="rounded-lg cursor-pointer text-sm gap-2"
          onClick={() => setTheme("light")}
        >
          <Sun className="h-4 w-4" /> Light
          {theme === "light" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg cursor-pointer text-sm gap-2"
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" /> Dark
          {theme === "dark" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg cursor-pointer text-sm gap-2"
          onClick={() => setTheme("system")}
        >
          <Monitor className="h-4 w-4" /> System
          {theme === "system" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
