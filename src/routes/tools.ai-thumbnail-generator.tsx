import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ToolPage } from "@/components/page";
import { seo } from "@/lib/seo";

const Generator = lazy(() => import("@/components/ai-thumbnail-generator").then((module) => ({ default: module.AiThumbnailGenerator })));
export const Route = createFileRoute("/tools/ai-thumbnail-generator")({
  head: () => seo("AI Text-to-Thumbnail Generator — Gemini HD Covers | CreatorKit Studio", "Generate real YouTube thumbnails and Shorts covers from text with Google Gemini. Choose 16:9 or 9:16, creative styles, headline, colors and effects, then download in HD."),
  component: Page,
});
function Page() {
  return <ToolPage title="AI Text-to-Thumbnail Generator" intro="Turn your idea into a real image with Google Gemini. YouTube thumbnails and Shorts covers, in 2K HD." privacy="Your prompt and style options are sent securely to Google for image generation. We don't upload your photos or save generated images. Google’s API data terms apply; avoid sensitive information."
    guide={<><h2>Create your next cover</h2><ul><li>Describe your subject, setting and composition.</li><li>Choose YouTube 16:9 or Shorts 9:16, then add a style, headline, accent color and effects.</li><li>Generate, review the actual image, then download the original HD file or regenerate a new variation.</li></ul><h2>Example</h2><p>“Epic PUBG gaming thumbnail with fire effects and a character holding M416.” Try Gaming, Fire and Sparks with a short headline such as “FINAL ZONE”.</p></>}
    faq={[{ q: "Is this a real AI-generated image?", a: "Yes. Google Gemini Nano Banana generates the image from your prompt. A result appears only after Google returns image data and your browser successfully reads it. We never substitute sample images." }, { q: "What resolution can I download?", a: "Requests use Google’s 2K image setting. The actual pixel dimensions are displayed with each completed image. Downloads preserve the original image without upscaling." }, { q: "Why might generation be unavailable?", a: "The owner’s Google AI Studio key needs access and available image-generation quota. Google may require billing. Provider errors and safety refusals are displayed rather than replaced with fake results." }, { q: "Will my custom text be exact?", a: "We ask Google to render your exact headline, but spelling, colors and composition can vary. Review the image before publishing. Regenerating makes a new request and may incur Google API charges." }, { q: "Can I use the image commercially?", a: "Review Google’s current terms and ensure you have rights to requested characters, logos and other content. Gemini images include Google’s SynthID watermark." }]}>
    <ClientOnly fallback={<div className="aspect-video bg-muted" />}><Suspense fallback={<div className="aspect-video bg-muted" />}><Generator /></Suspense></ClientOnly>
  </ToolPage>;
}