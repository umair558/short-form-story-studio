import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useAccount } from "./auth-provider";

const NAV = [
  { to: "/tools", label: "Tools" },
  { to: "/features", label: "Features" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAccount();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/tools/creator-workflow"
            className="ml-3 inline-flex h-10 items-center gap-1.5 rounded-lg bg-orange px-4 text-sm font-bold text-orange-foreground shadow-soft transition-all hover:brightness-105 active:scale-95"
          >
            Start creating <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </nav>
        <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button asChild variant="outline" className="h-10 px-3"><Link to={user ? '/account' : '/auth'}>{user ? 'Account' : 'Sign in'}</Link></Button>
        <Button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors hover:bg-muted lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t bg-background shadow-soft lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-base font-semibold hover:bg-muted" activeProps={{ className: "text-primary" }}>
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link to="/tools/creator-workflow" onClick={() => setOpen(false)} className="flex h-12 items-center justify-center gap-1.5 rounded-lg bg-orange font-bold text-orange-foreground active:scale-[0.98]">
                Start creating <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
