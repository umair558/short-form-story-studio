import { createFileRoute, Link } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/page";
import { LAST_UPDATED } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => seo("Privacy Policy — CreatorKit Studio", "How CreatorKit Studio handles your text inputs and images. Image tools run in your browser; AI inputs are processed only to generate results."),
  component: Page,
});

function Page() {
  return (
    <main>
      <PageHeader title="Privacy Policy" intro={`Last updated: ${LAST_UPDATED}`} />
      <article className="mx-auto mt-8 max-w-3xl space-y-4 px-4 leading-relaxed text-muted-foreground sm:px-6 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc">
        <p>This policy explains what information CreatorKit Studio (“we”, “us”) processes when you use this website, and why. We've written it in plain language.</p>
        <h2>Accounts</h2>
        <p>You can use every tool without creating an account. We don't ask for your name or email to use the tools.</p>
        <h2>Images</h2>
        <p>The Social Media Image Resizer and Image Compressor process images entirely inside your web browser. Your images are not uploaded to our servers or shared with third parties.</p>
        <h2>Text you submit to AI tools</h2>
        <p>The AI Text-to-Thumbnail Generator sends your text, headline and style options to Google Gemini through our server. Requests disable Google’s interaction storage. Google’s API data terms still apply. We do not save generated thumbnails; downloads remain on your device. No existing photo-editing tool uploads your images.</p>
        <p>When you use an AI tool (for example the Caption Generator), the text and options you enter are sent from your browser to our server and then to a third-party AI model provider to generate suggestions. We do not store your inputs or results in a database. Our hosting and AI providers may keep short-lived technical logs (such as request time and errors) to operate and secure their services. Please don't enter sensitive personal information into AI tools.</p>
        <h2>Technical data</h2>
        <p>Like most websites, our hosting provider automatically processes basic technical information such as IP address, browser type and pages requested, to deliver the site and protect against abuse.</p>
        <h2>Cookies and advertising</h2>
        <p>We don't currently use advertising or tracking cookies. If we add advertising in the future (for example Google AdSense), we will update this policy before doing so, describe the cookies used, and request consent where the law requires it.</p>
        <h2>Your choices</h2>
        <ul>
          <li>You can stop using the AI tools at any time; the image tools work without sending any data.</li>
          <li>Depending on where you live, you may have rights to access or delete personal data. Because we don't store tool inputs, there is usually nothing to retrieve.</li>
        </ul>
        <h2>Children</h2>
        <p>This site is not directed at children under 13, and we don't knowingly collect their personal information.</p>
        <h2>Changes</h2>
        <p>We may update this policy as the site changes. The “last updated” date above shows when it was last revised.</p>
        <h2>Contact</h2>
        <p>Questions? Visit our <Link to="/contact" className="font-semibold text-primary">contact page</Link>.</p>
      </article>
    </main>
  );
}
