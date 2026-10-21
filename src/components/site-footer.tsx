import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { TOOLS } from "@/lib/tools";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Everything creators need, in one place. Free tools for TikTok, Instagram Reels and YouTube Shorts creators.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Tools</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {TOOLS.slice(0, 6).map((t) => (
              <li key={t.slug}>
                <Link to={t.path} className="text-muted-foreground hover:text-foreground">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Company</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
            <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Use</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} CreatorKit Studio. Not affiliated with TikTok, Instagram or YouTube.
        </p>
      </div>
    </footer>
  );
}
