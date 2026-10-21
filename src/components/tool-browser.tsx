import { Search, SearchX, X } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, filterTools, type ToolFilter } from "@/lib/tools";
import { ToolCard } from "./tool-card";
import { cn } from "@/lib/utils";

export function ToolBrowser({
  initialQuery = "",
  initialCategory = "All",
  autoFocus = false,
}: {
  initialQuery?: string;
  initialCategory?: ToolFilter;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState<ToolFilter>(initialCategory);
  const results = filterTools(q, cat);
  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor="tool-search" className="sr-only">Search tools</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          id="tool-search"
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tools — captions, hashtags, resize…"
          className="field h-14 rounded-xl pl-12 pr-12 text-base shadow-soft"
        />
        {q && (
          <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => setCat(c)}
            className={cn(
              "h-10 rounded-full border px-4 text-sm font-semibold transition-all active:scale-95",
              cat === c ? "border-orange bg-orange text-orange-foreground" : "bg-background hover:border-foreground/20 hover:bg-muted",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{results.length} tools found</p>
      {results.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      ) : (
        <div className="card-surface mt-6 flex flex-col items-center p-10 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground"><SearchX className="h-6 w-6" aria-hidden /></span>
          <p className="mt-4 font-semibold">No tools match “{q}”{cat !== "All" ? ` in ${cat}` : ""}.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a simpler word like “caption”, “resize” or “hashtag”.</p>
          <button type="button" className="mt-4 h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90" onClick={() => { setQ(""); setCat("All"); }}>
            Show all tools
          </button>
        </div>
      )}
    </div>
  );
}
