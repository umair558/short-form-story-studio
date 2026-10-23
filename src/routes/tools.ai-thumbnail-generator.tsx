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
  return <ToolPage title="AI Thumbnail Generator" intro="Create cinematic YouTube thumbnails and Shorts covers. Sign in for five successful generations per day, resetting at 00:00 UTC." privacy="Your prompt and options are sent securely to Pollinations to create the image. We store your daily request status, not prompts or generated images. Avoid sensitive personal information."
    guide={<><h2>Create your next thumbnail</h2><ul><li>Describe the subject, setting and mood of your video.</li><li>Pick a style, add a short headline and an accent color.</li><li>Click Generate Thumbnail, review the actual image, then Download PNG or Regenerate for a new variation.</li></ul><h2>Example</h2><p>“A soldier in tactical gear holding a rifle in a burning battle zone.” Try Gaming with Fire and Sparks and the headline “FINAL ZONE”.</p></>}
    faq={[{ q: "Is this a real AI-generated image?", a: "Pollinations' Z-Image Turbo creates images from your prompt. A result appears only after a finished image is returned and your browser reads it. We never show templates or sample images as results." }, { q: "What size is the download?", a: "YouTube thumbnails download as 1280×720 PNG files. Shorts covers download as 720×1280 PNG files." }, { q: "Why might generation fail?", a: "Pollinations can reject an invalid key, exhausted Pollen balance, key budget or model permission, a rate limit, or a prompt under its content rules. Errors appear instead of fake images. There is no Lovable AI fallback or automatic retry." }, { q: "Will my headline be spelled exactly?", a: "We ask for your exact headline, but AI lettering can occasionally vary. Short headlines of 2–4 words work best. Check the image before publishing." }, { q: "Can I use named games, brands or celebrities?", a: "The image service may decline prompts naming copyrighted characters, brands or real people. Describe an original look instead, for example “a soldier in tactical gear” rather than a game character's name." }]}>
    <ClientOnly fallback={<div className="aspect-video bg-muted" />}><Suspense fallback={<div className="aspect-video bg-muted" />}><Generator /></Suspense></ClientOnly>
  </ToolPage>;
}
