import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { seo } from "@/lib/seo";
import { IMAGE_PRIVACY, ToolPage } from "@/components/page";

const ThumbnailMaker = lazy(() => import("@/components/thumbnail-maker").then((m) => ({ default: m.ThumbnailMaker })));

export const Route = createFileRoute("/tools/youtube-thumbnail-maker")({
  head: () => seo("Free YouTube Thumbnail Maker — 1280×720 Online Editor | CreatorKit Studio", "Make a YouTube thumbnail in your browser: add your photo, zoom and crop, adjust brightness and contrast, add bold outlined text and a badge, then download a 1280×720 JPG or PNG."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="YouTube Thumbnail Maker"
      intro="Add a photo, write a bold headline, tweak the look and download a 1280×720 thumbnail. Everything runs on your device."
      privacy={IMAGE_PRIVACY}
      guide={
        <>
          <h2>How to use it</h2>
          <ul>
            <li>Upload a background photo (or use a solid colour), then zoom and move it to frame your subject.</li>
            <li>Adjust brightness, contrast, saturation and the dark overlay so the text stands out.</li>
            <li>Write 2–5 words, choose size, position and colours, and optionally add a corner badge.</li>
            <li>Download as JPG (smaller) or PNG (sharper) and upload it in YouTube Studio.</li>
          </ul>
          <h2>Example</h2>
          <p>A close-up face photo, 30% overlay, the headline "I QUIT SUGAR" in white with a black outline at the bottom-left, and an orange "30 DAYS" badge.</p>
          <h2>Thumbnail tips</h2>
          <p>Thumbnails are viewed small, so use few words and large text. Need wording ideas? Try the Thumbnail Text Generator.</p>
        </>
      }
      faq={[
        { q: "What size is the download?", a: "Exactly 1280×720 pixels (16:9), YouTube's recommended thumbnail size." },
        { q: "Is my photo uploaded anywhere?", a: "No. Editing and export happen in your browser; the image never leaves your device." },
        { q: "YouTube says my file is too big.", a: "YouTube thumbnails must be under 2 MB. Export as JPG, which is usually well under that limit." },
      ]}
    >
      <ClientOnly fallback={<div className="card-surface aspect-video" />}>
        <Suspense fallback={<div className="card-surface aspect-video" />}>
          <ThumbnailMaker />
        </Suspense>
      </ClientOnly>
    </ToolPage>
  );
}
