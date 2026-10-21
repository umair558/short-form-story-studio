import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Smartphone, Sparkles, Zap, Copy, Download } from "lucide-react";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/page";

export const Route = createFileRoute("/features")({
  head: () => seo("Features — CreatorKit Studio", "Private in-browser image tools, AI writing helpers, one-tap copy and mobile-first design built for short-form creators."),
  component: Page,
});

const FEATURES = [
  { icon: Sparkles, t: "Real AI writing help", d: "Captions, hooks, hashtags, ideas, bios and thumbnail text are written live by an AI model — never canned templates." },
  { icon: Lock, t: "Private image processing", d: "The resizer and compressor run in your browser. Your photos are never uploaded." },
  { icon: Smartphone, t: "Built for phones", d: "Large tap targets and a layout that works on small Android screens as well as desktops." },
  { icon: Copy, t: "One-tap copy", d: "Copy any suggestion or the whole set with clear confirmation." },
  { icon: Download, t: "Instant downloads", d: "Download processed images as JPG, PNG or WebP with sensible file names." },
  { icon: Zap, t: "Fast and lightweight", d: "No sign-up, no heavy scripts, no pop-ups. Just open a tool and go." },
];

function Page() {
  return (
    <main>
      <PageHeader eyebrow="Features" title="Made for creators who move fast" intro="CreatorKit Studio focuses on the small, repetitive jobs around every post so you can spend more time on the content itself." />
      <section className="mx-auto mt-10 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.t} className="card-surface p-5">
            <f.icon className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="mt-3 font-semibold">{f.t}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>
      <div className="mt-10 text-center">
        <Link to="/tools" className="inline-flex h-11 items-center rounded-md bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90">Browse all tools</Link>
      </div>
    </main>
  );
}
