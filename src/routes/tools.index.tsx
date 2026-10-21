import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/page";
import { ToolBrowser } from "@/components/tool-browser";

export const Route = createFileRoute("/tools/")({
  validateSearch: z.object({
    q: z.string().max(100).optional(),
    cat: z.enum(["All", "Workflow", "AI Writing", "Social Media", "Image"]).optional(),
  }),
  head: () => seo("All Creator Tools — CreatorKit Studio", "Search and filter free creator tools: AI captions, hooks, hashtags, bios, content ideas, thumbnail text, image resizer and compressor."),
  component: ToolsPage,
});

function ToolsPage() {
  const { q, cat } = Route.useSearch();
  return (
    <main>
      <PageHeader eyebrow="Tools" title="All creator tools" intro="Search by name or task, or filter by category. Every tool opens instantly — no account required." />
      <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <ToolBrowser key={`${q ?? ""}|${cat ?? ""}`} initialQuery={q ?? ""} initialCategory={cat ?? "All"} />
      </section>
    </main>
  );
}
