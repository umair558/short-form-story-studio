import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/page";

export const Route = createFileRoute("/about")({
  head: () => seo("About CreatorKit Studio", "CreatorKit Studio builds free, honest, privacy-respecting tools for TikTok, Instagram Reels and YouTube Shorts creators worldwide."),
  component: Page,
});

function Page() {
  return (
    <main>
      <PageHeader eyebrow="About" title="Tools that respect creators" />
      <div className="mx-auto mt-6 max-w-3xl space-y-4 px-4 text-base leading-relaxed text-muted-foreground sm:px-6">
        <p>CreatorKit Studio is a collection of free tools for short-form video creators around the world. We focus on the tasks that come with every post — writing captions, finding a hook, picking hashtags and preparing images.</p>
        <p>We follow a few simple principles: tools should actually work, they should be honest about their limits (we never claim a hashtag is trending or that content will go viral), and your files should stay on your device whenever possible.</p>
        <p>CreatorKit Studio is independent and not affiliated with TikTok, Instagram, Meta, YouTube or Google.</p>
      </div>
    </main>
  );
}
