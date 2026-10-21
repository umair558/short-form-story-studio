import { Search } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, filterTools, type ToolCategory } from "@/lib/tools";
import { ToolCard } from "./tool-card";
import { cn } from "@/lib/utils";

export function ToolBrowser({ initialQuery = "", autoFocus = false }: { initialQuery?: string; autoFocus?: boolean }) {
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState<"All" | ToolCategory>("All");
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
          className="field h-14 rounded-xl pl-12 text-base shadow-card"
        />
      </form>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => setCat(c)}
            className={cn(
              "h-9 rounded-full border px-4 text-sm font-medium transition-colors",
              cat === c ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
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
        <div className="card-surface mt-6 p-8 text-center">
          <p className="font-medium">No tools match “{q}”.</p>
          <button type="button" className="mt-3 text-sm font-semibold text-primary" onClick={() => { setQ(""); setCat("All"); }}>
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
