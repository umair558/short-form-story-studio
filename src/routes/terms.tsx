import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/page";
import { LAST_UPDATED } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => seo("Terms of Use — CreatorKit Studio", "The terms for using CreatorKit Studio's free creator tools, including AI-generated content and image processing."),
  component: Page,
});

function Page() {
  return (
    <main>
      <PageHeader title="Terms of Use" intro={`Last updated: ${LAST_UPDATED}`} />
      <article className="mx-auto mt-8 max-w-3xl space-y-4 px-4 leading-relaxed text-muted-foreground sm:px-6 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc">
        <p>By using CreatorKit Studio you agree to these terms. If you don't agree, please don't use the site.</p>
        <h2>Using the tools</h2>
        <p>The tools are provided free of charge for personal and commercial content creation. Please don't misuse the service — for example by trying to overload it, automate bulk requests, or generate content that is illegal, hateful, harassing or that infringes others' rights.</p>
        <h2>AI-generated content</h2>
        <p>AI suggestions are generated automatically and may be inaccurate, unoriginal or unsuitable. Review and edit everything before publishing. You are responsible for what you post and for following each platform's rules. We don't guarantee any result, such as views, followers or reach.</p>
        <h2>Your content</h2>
        <p>You keep all rights to the text and images you provide and to the results you create. Images you process stay on your device.</p>
        <h2>Availability</h2>
        <p>We aim to keep the tools available but may change, limit or discontinue features at any time. AI tools may be temporarily unavailable, for example due to usage limits.</p>
        <h2>No warranty</h2>
        <p>The service is provided “as is” without warranties of any kind, to the extent permitted by law. To the extent permitted by law, we are not liable for indirect or consequential losses arising from your use of the site.</p>
        <h2>Trademarks</h2>
        <p>TikTok, Instagram, YouTube and other names are trademarks of their respective owners. CreatorKit Studio is not affiliated with or endorsed by them.</p>
        <h2>Changes</h2>
        <p>We may update these terms from time to time. Continued use after changes means you accept the updated terms. Questions? See our <Link to="/contact" className="font-semibold text-primary">contact page</Link>.</p>
      </article>
    </main>
  );
}
