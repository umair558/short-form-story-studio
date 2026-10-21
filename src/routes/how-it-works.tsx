import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/page";

export const Route = createFileRoute("/how-it-works")({
  head: () => seo("How It Works — CreatorKit Studio", "How CreatorKit Studio's AI writing tools and private in-browser image tools work, and what happens to your data."),
  component: Page,
});

function Page() {
  return (
    <main>
      <PageHeader eyebrow="How It Works" title="Simple tools, clear rules" intro="Here's exactly what happens when you use each type of tool." />
      <div className="mx-auto mt-10 max-w-3xl space-y-6 px-4 sm:px-6">
        <section className="card-surface p-6">
          <h2 className="text-xl font-semibold">AI writing tools</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>You enter a topic or niche and choose options like platform and tone.</li>
            <li>Your input is checked for length and sent securely from our server to an AI model.</li>
            <li>The model writes fresh suggestions, which appear on the page for you to copy.</li>
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">We don't save your inputs or results. If the AI service is unavailable, the tool tells you so instead of showing placeholder text.</p>
        </section>
        <section className="card-surface p-6">
          <h2 className="text-xl font-semibold">Image tools</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>You choose an image from your device.</li>
            <li>Your browser decodes it and redraws it at the new size or quality.</li>
            <li>You download the result. Nothing is uploaded.</li>
          </ol>
        </section>
        <p className="text-center"><Link to="/tools" className="font-semibold text-primary">Try a tool →</Link></p>
      </div>
    </main>
  );
}
