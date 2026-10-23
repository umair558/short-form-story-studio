import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

function ProfileMenu() {
  const { user } = useAccount();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!user) {
    return (
      <Button asChild variant="outline" className="h-10 px-3">
        <Link to="/auth">Sign in</Link>
      </Button>
    );
  }

  const name =
    (user.user_metadata?.name as string | undefined) || user.email || "Account";
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-1.5 rounded-full border bg-background pl-1 pr-2 transition-colors hover:bg-muted"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {initial}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border bg-popover shadow-lg"
        >
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-bold">{name}</p>
            {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
          </div>
          <div className="p-1.5">
            <Link
              to="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <UserRound className="h-4 w-4 text-muted-foreground" aria-hidden /> Profile
            </Link>
            <Link
              to="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <Settings className="h-4 w-4 text-muted-foreground" aria-hidden /> Account Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                setOpen(false);
                await supabase.auth.signOut();
                void navigate({ to: "/" });
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" aria-hidden /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:justify-between sm:px-6">
        <Logo />
        <nav
          aria-label="Main"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:flex-none"
        >
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:px-3 sm:text-sm"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/tools/creator-workflow"
            className="ml-1 hidden h-10 shrink-0 items-center gap-1.5 rounded-lg bg-orange px-4 text-sm font-bold text-orange-foreground shadow-soft transition-all hover:brightness-105 active:scale-95 md:inline-flex"
          >
            Start creating <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
