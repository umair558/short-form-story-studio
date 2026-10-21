import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ToolInfo } from "@/lib/tools";

export function ToolCard({ tool }: { tool: ToolInfo }) {
  const Icon = tool.icon;
  return (
    <Link to={tool.path} className="card-surface card-interactive group flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">{tool.category}</span>
      </div>
      <h3 className="mt-4 text-base font-semibold">{tool.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{tool.short}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Open tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
