import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { IMAGE_PRIVACY, ToolPage } from "@/components/page";

const ImageResizer = lazy(() => import("@/components/image-resizer").then((m) => ({ default: m.ImageResizer })));

export const Route = createFileRoute("/tools/image-resizer")({
  head: () => seo("Social Media Image Resizer — Instagram, TikTok, YouTube Sizes | CreatorKit Studio", "Resize images to exact Instagram, Story, TikTok, YouTube thumbnail, X and Facebook sizes. Free and private: runs in your browser."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Social Media Image Resizer"
      intro="Pick a platform size, choose crop or fit, and download a perfectly sized image. Everything happens on your device."
      privacy={IMAGE_PRIVACY}
      guide={
        <>
          <h2>Crop to fill vs. fit whole image</h2>
          <p><strong>Crop to fill</strong> scales your image to cover the full frame and trims the edges evenly from the center — best for photos. <strong>Fit whole image</strong> keeps everything visible and adds space around it (white for JPG, transparent for PNG/WebP) — best for graphics with text near the edges.</p>
          <h2>Common sizes</h2>
          <ul>
            <li>Instagram post: 1080×1080 (square) or 1080×1350 (portrait)</li>
            <li>Stories, Reels, TikTok and Shorts covers: 1080×1920</li>
            <li>YouTube thumbnail: 1280×720</li>
          </ul>
          <p>Platforms update their recommendations from time to time, so check their help pages for the latest guidance. Upscaling a small image will not add detail.</p>
        </>
      }
    >
      <ClientOnly fallback={<div className="card-surface h-64" />}>
        <Suspense fallback={<div className="card-surface h-64" />}>
          <ImageResizer />
        </Suspense>
      </ClientOnly>
    </ToolPage>
  );
}
