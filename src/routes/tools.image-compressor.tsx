import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { IMAGE_PRIVACY, ToolPage } from "@/components/page";

const ImageCompressor = lazy(() => import("@/components/image-compressor").then((m) => ({ default: m.ImageCompressor })));

export const Route = createFileRoute("/tools/image-compressor")({
  head: () => seo("Free Image Compressor — Reduce JPG, PNG & WebP Size | CreatorKit Studio", "Compress images in your browser with a quality slider. See original and compressed sizes, then download. No uploads."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Image Compressor"
      intro="Upload an image, choose a quality level, and download a smaller file. Your image never leaves your device."
      privacy={IMAGE_PRIVACY}
      guide={
        <>
          <h2>How compression works here</h2>
          <p>Your browser re-encodes the image as JPG or WebP at the quality you choose. Lower quality removes fine detail the eye rarely notices, which can shrink files dramatically. Reducing the maximum width saves even more space.</p>
          <ul>
            <li><strong>JPG</strong> works everywhere. Transparent areas become white.</li>
            <li><strong>WebP</strong> is usually smaller at the same quality and supports transparency.</li>
            <li>Already-optimized images may not get smaller — we show you the real result so you can decide.</li>
          </ul>
          <p>Note: re-encoding removes most photo metadata (like camera details and location), which can be a privacy bonus.</p>
        </>
      }
    >
      <ClientOnly fallback={<div className="card-surface h-64" />}>
        <Suspense fallback={<div className="card-surface h-64" />}>
          <ImageCompressor />
        </Suspense>
      </ClientOnly>
    </ToolPage>
  );
}
