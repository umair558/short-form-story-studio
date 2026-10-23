import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ToolPage } from "@/components/page";
import { seo } from "@/lib/seo";

const Generator = lazy(() => import("@/components/ai-thumbnail-generator").then((module) => ({ default: module.AiThumbnailGenerator })));
export const Route = createFileRoute("/tools/ai-thumbnail-generator")({
  head: () => seo("AI Thumbnail Generator — Real 1280×720 YouTube Thumbnails | CreatorKit Studio", "Generate real AI YouTube thumbnails and Shorts covers from text. Gaming, MrBeast-style, Cinematic, Tech, Vlog and Documentary styles with bold headlines, downloadable as PNG."),
  component: Page,
});
function Page() {
  return <ToolPage title="AI Thumbnail Generator" intro="Describe your video and get a real AI-generated thumbnail with cinematic lighting and bold text. 1280×720 PNG, ready for YouTube." privacy="Your prompt and options are sent securely to our AI image service to create the image. We don't upload your photos or save generated images. Avoid including sensitive personal information."
    guide={<><h2>Create your next thumbnail</h2><ul><li>Describe the subject, setting and mood of your video.</li><li>Pick a style, add a short headline and an accent color.</li><li>Click Generate Thumbnail, review the actual image, then Download PNG or Regenerate for a new variation.</li></ul><h2>Example</h2><p>“A soldier in tactical gear holding a rifle in a burning battle zone.” Try Gaming with Fire and Sparks and the headline “FINAL ZONE”.</p></>}
    faq={[{ q: "Is this a real AI-generated image?", a: "Yes. An AI image model creates every thumbnail from your prompt. A result appears only after a finished image is returned and your browser reads it. We never show templates or sample images as results." }, { q: "What size is the download?", a: "YouTube thumbnails download as 1280×720 PNG files. Shorts covers download as 720×1280 PNG files." }, { q: "Why might generation fail?", a: "The image service can be busy, the site's AI credits can run out, or a prompt can be declined under content rules. The reason is shown clearly instead of a fake result." }, { q: "Will my headline be spelled exactly?", a: "We ask for your exact headline, but AI lettering can occasionally vary. Short headlines of 2–4 words work best. Check the image before publishing." }, { q: "Can I use named games, brands or celebrities?", a: "The image service may decline prompts naming copyrighted characters, brands or real people. Describe an original look instead, for example “a soldier in tactical gear” rather than a game character's name." }]}>
    <ClientOnly fallback={<div className="aspect-video bg-muted" />}><Suspense fallback={<div className="aspect-video bg-muted" />}><Generator /></Suspense></ClientOnly>
  </ToolPage>;
}
