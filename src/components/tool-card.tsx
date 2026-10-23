import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ToolInfo } from "@/lib/tools";
import { TONE } from "@/lib/tone";
import { cn } from "@/lib/utils";
import { BRANDS, BrandIcon } from "./brand-icons";
import { TOOL_ICONS } from "@/lib/tool-icons";

export function ToolCard({ tool }: { tool: ToolInfo }) {
  const Icon = tool.icon;
  const t = TONE[tool.tone];
  const icon3d = TOOL_ICONS[tool.slug];
  return (
    <Link
      to={tool.path}
      className={cn(
        "card-surface card-interactive group flex h-full min-h-28 flex-col p-3 sm:min-h-56 sm:p-5 active:scale-[0.99]",
        t.hover,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid h-10 w-10 place-items-center rounded-xl sm:h-12 sm:w-12", t.icon)}>
          {icon3d ? (
            <img
              src={icon3d}
              alt=""
              loading="lazy"
              width={48}
              height={48}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              className="pointer-events-none h-9 w-9 select-none object-contain sm:h-11 sm:w-11"
            />
          ) : (
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
          )}
        </span>
        {tool.social && (
          <BrandIcon
            brand={
              tool.slug.includes("youtube") || tool.slug.includes("thumbnail")
                ? "YouTube"
                : "Instagram"
            }
            className="h-5 w-5 sm:hidden"
          />
        )}
        <span
          className={cn(
            "hidden rounded-full px-2.5 py-1 text-xs sm:inline-flex font-semibold",
            t.badge,
          )}
        >
          {tool.category}
        </span>
      </div>
      <h3 className="mt-2.5 text-[13px] font-bold leading-tight sm:mt-4 sm:text-base">{tool.name}</h3>
      <p className="mt-1.5 hidden flex-1 sm:block text-sm leading-relaxed text-muted-foreground">
        {tool.short}
      </p>
      <div className="mt-auto hidden items-center pt-4 sm:mt-4 sm:flex justify-between gap-2">
        <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", t.text)}>
          Open tool{" "}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
        {tool.social && (
          <span
            className="hidden items-center gap-1.5 opacity-80 sm:flex"
            aria-label="Works for YouTube, Instagram, TikTok and X"
          >
            {BRANDS.map((b) => (
              <BrandIcon key={b} brand={b} className="h-3.5 w-3.5" />
            ))}
          </span>
        )}
      </div>
    </Link>
  );
}
