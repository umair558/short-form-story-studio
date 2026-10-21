import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Zap, MousePointerClick, Search } from "lucide-react";
import { useState } from "react";
import { seo } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";
import { WorkflowTool } from "@/components/workflow-tool";
import { AdSlot } from "@/components/ad-slot";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => seo("CreatorKit Studio — Create Better Content. In Less Time.", "Free AI caption, hook, hashtag and bio generators plus in-browser image resizer and compressor for TikTok, Reels and Shorts creators."),
  component: Index,
});

export const FAQS = [
  { q: "Are the tools free?", a: "Yes. Every tool is free to use without an account. AI tools may have fair-use limits to keep the service available for everyone." },
  { q: "Do you upload my images?", a: "No. The Image Resizer and Image Compressor run entirely in your browser. Your photos never leave your device." },
  { q: "How do the AI tools work?", a: "Your topic and options are sent securely to an AI model, which writes suggestions in real time. We don't store your text or link it to an identity. Always review results before posting." },
  { q: "Are the hashtags trending?", a: "We don't have access to live trend data, so we never claim a hashtag is trending. Suggestions are chosen for relevance to your topic. Check each platform's search for current popularity." },
  { q: "Which platforms are supported?", a: "TikTok, Instagram Reels and YouTube Shorts. The image resizer also includes YouTube, X and Facebook sizes." },
  { q: "Can I use the generated content commercially?", a: "Yes, you're free to use what you generate. You're responsible for making sure your final post follows platform rules and doesn't infringe anyone's rights." },
];

function Index() {
  const popular = TOOLS.filter((t) => t.popular);
  return (
    <main>
      <section className="mx-auto max-w-4xl px-4 pb-10 pt-12 text-center sm:px-6 sm:pt-20">
        <p className="inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
          Everything creators need, in one place.
        </p>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] sm:text-6xl">
          Create Better Content.<br className="hidden sm:block" /> <span className="text-primary">In Less Time.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Free tools for TikTok, Instagram Reels and YouTube Shorts creators — AI writing helpers for captions, hooks and hashtags,
          plus private image tools that run right in your browser.
        </p>
        <div className="mx-auto mt-8 max-w-2xl text-left">
          <HeroSearch />
        </div>
      </section>

      <section aria-labelledby="workflow-title" className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl border bg-primary-soft p-5 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Featured tool</p>
              <h2 id="workflow-title" className="mt-1 text-2xl font-bold sm:text-3xl">Creator Workflow</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">Enter one topic and get a hook, caption, hashtags and thumbnail text in one go.</p>
            </div>
            <Link to="/tools/creator-workflow" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Learn more <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-6"><WorkflowTool compact /></div>
        </div>
      </section>

      <section id="tools" aria-labelledby="all-tools" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 id="all-tools" className="text-2xl font-bold sm:text-3xl">All tools</h2>
        <p className="mt-2 text-muted-foreground">Pick a tool to get started. No sign-up needed.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => <ToolCard key={t.slug} tool={t} />)}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 sm:px-6"><AdSlot id="home-mid" /></div>

      <section aria-labelledby="popular" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 id="popular" className="text-2xl font-bold sm:text-3xl">Popular with creators</h2>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {popular.map((t) => {
            const Icon = t.icon;
            return (
              <li key={t.slug} className="min-w-0">
                <Link to={t.path} className="card-surface card-interactive flex min-w-0 items-center gap-4 p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block truncate text-sm text-muted-foreground">{t.short}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="how" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 id="how" className="text-2xl font-bold sm:text-3xl">How it works</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: MousePointerClick, t: "Choose a tool", d: "Search or browse by category to find what you need." },
            { icon: Zap, t: "Add your topic or image", d: "Type a few words, pick a platform, or drop in a photo." },
            { icon: ShieldCheck, t: "Copy or download", d: "Copy text with one tap or download your processed image." },
          ].map((s, i) => (
            <li key={s.t} className="card-surface p-5">
              <span className="text-sm font-semibold text-primary">Step {i + 1}</span>
              <h3 className="mt-2 flex items-center gap-2 font-semibold"><s.icon className="h-4 w-4 text-primary" aria-hidden />{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="faq" className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
        <h2 id="faq" className="text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-4">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`}>
              <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
}

function HeroSearch() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/tools", search: { q: q.trim() || undefined } });
      }}
      className="flex gap-2"
    >
      <label htmlFor="hero-search" className="sr-only">Search tools</label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input id="hero-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a tool: captions, resize, hashtags…" className="field h-14 rounded-xl pl-12 shadow-card" />
      </div>
      <button type="submit" className="h-14 rounded-xl bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90">Search</button>
    </form>
  );
}

