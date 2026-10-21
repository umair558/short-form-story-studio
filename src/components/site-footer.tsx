import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { TOOLS } from "@/lib/tools";
import { BRANDS, BrandIcon } from "./brand-icons";

const linkCls = "text-muted-foreground transition-colors hover:text-primary";

export function SiteFooter() {
  const ai = TOOLS.filter((t) => t.category !== "Image");
  const img = TOOLS.filter((t) => t.category === "Image");
  return (
    <footer className="mt-24 border-t bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Everything creators need, in one place. Free tools to plan, write and prepare content for YouTube, Instagram, TikTok and X.
          </p>
          <div className="mt-5 flex items-center gap-3" aria-label="Platforms our tools support">
            {BRANDS.map((b) => (
              <span key={b} className="grid h-9 w-9 place-items-center rounded-lg border bg-background"><BrandIcon brand={b} className="h-4 w-4" /></span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold">AI & workflow</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {ai.map((t) => <li key={t.slug}><Link to={t.path} className={linkCls}>{t.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold">Image tools</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {img.map((t) => <li key={t.slug}><Link to={t.path} className={linkCls}>{t.name}</Link></li>)}
            <li><Link to="/tools" className={linkCls}>All tools</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold">Company</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className={linkCls}>About</Link></li>
            <li><Link to="/contact" className={linkCls}>Contact</Link></li>
            <li><Link to="/privacy" className={linkCls}>Privacy Policy</Link></li>
            <li><Link to="/terms" className={linkCls}>Terms of Use</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} CreatorKit Studio. Not affiliated with or endorsed by YouTube, Instagram, TikTok or X. Logos are trademarks of their owners.
        </p>
      </div>
    </footer>
  );
}
