import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ToolInfo } from "@/lib/tools";
import { TONE } from "@/lib/tone";
import { cn } from "@/lib/utils";
import { BRANDS, BrandIcon } from "./brand-icons";

export function ToolCard({ tool }: { tool: ToolInfo }) {
  const Icon = tool.icon;
  const t = TONE[tool.tone];
  return (
    <Link
      to={tool.path}
      className={cn("card-surface card-interactive group flex h-full min-h-44 flex-col p-4 sm:min-h-56 sm:p-5 active:scale-[0.99]", t.hover)}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid h-12 w-12 place-items-center rounded-xl", t.icon)}>
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        {tool.social && <BrandIcon brand={tool.slug.includes("youtube") || tool.slug.includes("thumbnail") ? "YouTube" : "Instagram"} className="h-5 w-5 sm:hidden" />}
        <span className={cn("hidden rounded-full px-2.5 py-1 text-xs sm:inline-flex font-semibold", t.badge)}>{tool.category}</span>
      </div>
      <h3 className="mt-4 text-base font-bold">{tool.name}</h3>
      <p className="mt-1.5 hidden flex-1 sm:block text-sm leading-relaxed text-muted-foreground">{tool.short}</p>
      <div className="mt-auto flex items-center pt-4 sm:mt-4 justify-between gap-2">
        <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", t.text)}>
          Open tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
        {tool.social && (
          <span className="hidden items-center gap-1.5 opacity-80 sm:flex" aria-label="Works for YouTube, Instagram, TikTok and X">
            {BRANDS.map((b) => <BrandIcon key={b} brand={b} className="h-3.5 w-3.5" />)}
          </span>
        )}
      </div>
    </Link>
  );
}
