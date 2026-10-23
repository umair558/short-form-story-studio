import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Copy,
  Image as ImageIcon,
  MousePointerClick,
  PenLine,
  Search,
  Share2,
  Sparkles,
  UserX,
  Workflow,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { seo } from "@/lib/seo";
import { filterTools, TOOLS, type ToolFilter } from "@/lib/tools";
import { TONE } from "@/lib/tone";
import { cn } from "@/lib/utils";
import { ToolCard } from "@/components/tool-card";
import { WorkflowTool } from "@/components/workflow-tool";
import { AdSlot } from "@/components/ad-slot";
import { BRANDS, BrandIcon, type Brand } from "@/components/brand-icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ComingSoon } from "@/components/coming-soon";
import heroImg from "@/assets/hero-creator-tools.jpg";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "CreatorKit Studio — Create. Grow. Go Viral.",
      "Free AI caption, hook, hashtag and bio generators plus private in-browser image tools for YouTube, Instagram, TikTok and X creators.",
    ),
  component: Index,
});

export const FAQS = [
  { q: "Are the tools free?", a: "Most tools open without an account. AI thumbnail generation requires a free account and includes five successful thumbnails per UTC day." },
  { q: "Do you upload my images?", a: "No. The Image Resizer and Image Compressor run entirely in your browser. Your photos never leave your device." },
  { q: "How do the AI tools work?", a: "Your topic and options are sent securely to an AI model, which writes suggestions in real time. We don't store your text or link it to an identity. Always review results before posting." },
  { q: "Are the hashtags trending?", a: "We don't have access to live trend data, so we never claim a hashtag is trending. Suggestions are chosen for relevance to your topic. Check each platform's search for current popularity." },
  { q: "Which platforms are supported?", a: "TikTok, Instagram Reels, YouTube Shorts and X. The image resizer also includes YouTube thumbnail, X and Facebook sizes." },
  { q: "Can I use the generated content commercially?", a: "Yes, you're free to use what you generate. You're responsible for making sure your final post follows platform rules and doesn't infringe anyone's rights." },
];

const PLATFORM_INFO: Record<Brand, string> = {
  YouTube: "Shorts hooks, titles and thumbnail text",
  Instagram: "Reels captions, hashtags and bios",
  TikTok: "Scroll-stopping hooks and captions",
  X: "Short posts, bios and image sizes",
};

const FINDERS: { title: string; desc: string; cat: ToolFilter; icon: typeof Sparkles; tint: string }[] = [
  { title: "AI Writing", desc: "Captions, hooks, hashtags, bios and ideas.", cat: "AI Writing", icon: PenLine, tint: "bg-violet-soft text-violet" },
  { title: "Social Media", desc: "Everything you need for a post.", cat: "Social Media", icon: Share2, tint: "bg-orange-soft text-orange-ink" },
  { title: "Image Tools", desc: "Resize and compress, privately.", cat: "Image", icon: ImageIcon, tint: "bg-teal-soft text-teal" },
  { title: "Creator Workflow", desc: "A full post package from one topic.", cat: "Workflow", icon: Workflow, tint: "bg-primary-soft text-primary" },
];

function SectionHead({ id, eyebrow, title, intro }: { id: string; eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-bold uppercase tracking-wider text-orange-ink">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-2xl font-extrabold sm:text-4xl">{title}</h2>
      {intro && <p className="mt-3 text-muted-foreground sm:text-lg">{intro}</p>}
    </div>
  );
}

function Index() {
  const popular = TOOLS.filter((t) => t.popular);
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.1fr_1fr]">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs font-bold text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Everything creators need, in one place.
          </p>
          <h1 className="mt-5 text-[2.6rem] font-extrabold leading-[1.05] sm:text-6xl">
            Create. <span className="text-primary">Grow.</span> <span className="text-orange">Go Viral.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Everything creators need to plan, create, and optimize content — all in one place.
          </p>
          <div className="mt-7 max-w-xl"><HeroSearch /></div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a href="#tools" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-soft transition-all hover:bg-primary/90 active:scale-[0.98]">
              Explore Free Tools <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link to="/tools/creator-workflow" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange px-6 font-bold text-orange-foreground shadow-soft transition-all hover:brightness-105 active:scale-[0.98]">
              <Sparkles className="h-4 w-4" aria-hidden /> Create Content
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted-foreground">
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-green" aria-hidden />Free Tools</li>
            <li className="flex items-center gap-1.5"><UserX className="h-4 w-4 text-primary" aria-hidden />Most Tools Without Login</li>
            <li className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-orange" aria-hidden />Built for Creators</li>
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <img
            src={heroImg}
            width={1024}
            height={896}
            fetchPriority="high"
            alt="Illustration of creator tools: a phone with a video, caption and hashtag cards, an image crop frame and a thumbnail"
            className="h-auto w-full"
          />
        </div>
      </section>

      {/* Platforms */}
      <section aria-labelledby="platforms" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h2 id="platforms" className="text-center text-xl font-extrabold sm:text-2xl">Create for Your Favorite Platforms</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {BRANDS.map((b) => (
            <li key={b} className="min-w-0">
              <Link to="/tools" search={{ cat: "Social Media" }} className="card-surface card-interactive flex h-full flex-col items-center p-5 text-center active:scale-[0.99]">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border bg-background"><BrandIcon brand={b} className="h-7 w-7" /></span>
                <span className="mt-3 font-bold">{b}</span>
                <span className="mt-1 text-xs text-muted-foreground sm:text-sm">{PLATFORM_INFO[b]}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-muted-foreground">Independent tools. Not affiliated with or endorsed by these platforms.</p>
      </section>

      {/* Featured workflow */}
      <section aria-labelledby="workflow-title" className="mx-auto mt-6 max-w-6xl px-4 sm:px-6">
        <div className="border-y border-violet/20 bg-primary-soft p-5 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-soft px-3 py-1 text-xs font-bold text-violet">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Featured tool
              </span>
              <h2 id="workflow-title" className="mt-3 text-2xl font-extrabold sm:text-3xl">Creator Workflow</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">One topic in — a hook, caption, hashtags and thumbnail text out.</p>
            </div>
            <Link to="/tools/creator-workflow" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
              Open full tool <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-6"><WorkflowTool compact /></div>
        </div>
      </section>

      {/* Popular */}
      <section aria-labelledby="popular" className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <SectionHead id="popular" eyebrow="Most used" title="Popular Creator Tools" />
        <div className="tool-row mt-8 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </section>

      {/* Finder */}
      <section aria-labelledby="finder" className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <SectionHead id="finder" eyebrow="Browse" title="Find the Right Tool" />
        <ul className="tool-row mt-8 sm:grid-cols-2 lg:grid-cols-4">
          {FINDERS.map((f) => {
            const n = filterTools("", f.cat).length;
            return (
              <li key={f.title} className="min-w-0">
                <Link to="/tools" search={{ cat: f.cat }} className="card-surface card-interactive group flex h-full flex-col p-5 active:scale-[0.99]">
                  <span className={cn("grid h-11 w-11 place-items-center rounded-xl", f.tint)}><f.icon className="h-5 w-5" aria-hidden /></span>
                  <h3 className="mt-4 font-bold">{f.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{f.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {n} {n === 1 ? "tool" : "tools"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* All tools */}
      <section id="tools" aria-labelledby="all-tools" className="mx-auto mt-20 max-w-6xl scroll-mt-24 px-4 sm:px-6">
        <SectionHead id="all-tools" eyebrow="Free" title="All tools" intro="Pick your next tool. Sign in for five daily AI thumbnails." />
        <div className="tool-row mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6"><ComingSoon /></div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6"><AdSlot id="home-mid" /></div>

      {/* How it works */}
      <section aria-labelledby="how" className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <SectionHead id="how" eyebrow="Simple" title="How it works" />
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: MousePointerClick, t: "Choose Your Tool", d: "Search or browse by category to find what you need.", tint: "bg-primary-soft text-primary" },
            { icon: PenLine, t: "Create Your Content", d: "Type a topic, pick a platform, or drop in a photo.", tint: "bg-orange-soft text-orange-ink" },
            { icon: Copy, t: "Copy, Download, and Publish", d: "Copy text with one tap or download your image, then post.", tint: "bg-teal-soft text-teal" },
          ].map((s, i) => (
            <li key={s.t} className="card-surface relative p-6">
              <span className="text-4xl font-extrabold text-muted-foreground/25" aria-hidden>0{i + 1}</span>
              <span className={cn("absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-xl", s.tint)}><s.icon className="h-5 w-5" aria-hidden /></span>
              <h3 className="mt-3 text-lg font-bold"><span className="sr-only">Step {i + 1}: </span>{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mx-auto mt-20 max-w-3xl px-4 sm:px-6">
        <h2 id="faq" className="text-2xl font-extrabold sm:text-3xl">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-4">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}

/** Instant search: results appear as you type. */
function HeroSearch() {
  const [q, setQ] = useState("");
  const results = q.trim() ? filterTools(q, "All").slice(0, 5) : [];
  return (
    <div className="relative">
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="hero-search" className="sr-only">Search tools</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          id="hero-search"
          type="search"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tools: captions, resize, hashtags…"
          className="field h-14 rounded-xl pl-12 shadow-soft"
          aria-controls="hero-results"
        />
      </form>
      {q.trim() && (
        <div id="hero-results" aria-live="polite" className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border bg-popover shadow-card-hover">
          {results.length ? (
            <ul>
              {results.map((t) => {
                const Icon = t.icon;
                return (
                  <li key={t.slug}>
                    <Link to={t.path} className="flex items-center gap-3 px-4 py-3 hover:bg-muted focus-visible:bg-muted">
                      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", TONE[t.tone].icon)}><Icon className="h-4 w-4" aria-hidden /></span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{t.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{t.short}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-4 text-sm text-muted-foreground">
              No tools match “{q}”. <Link to="/tools" className="font-semibold text-primary">Browse all tools</Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
