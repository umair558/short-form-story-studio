import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { AI_PRIVACY, ToolPage } from "@/components/page";
import { AiListTool } from "@/components/ai-list-tool";

export const Route = createFileRoute("/tools/thumbnail-text")({
  head: () => seo("Thumbnail Text Generator — Short Cover Text Ideas | CreatorKit Studio", "Generate ten short, attention-grabbing 2–5 word text overlays for YouTube thumbnails and Reels or TikTok covers."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Thumbnail Text Generator"
      intro="Enter your video topic and get ten short text overlays for your thumbnail or cover image."
      privacy={AI_PRIVACY}
      guide={
        <>
          <h2>Tips for readable thumbnail text</h2>
          <p>Thumbnails are often viewed at a small size on phones. Short text in a bold font with strong contrast is easier to read at a glance.</p>
          <ul>
            <li><strong>Keep it to 2–5 words.</strong> Let the image do the rest.</li>
            <li><strong>Complement the title,</strong> don't repeat it word for word.</li>
            <li><strong>Stay honest.</strong> Text that doesn't match the video can reduce watch time and trust.</li>
          </ul>
          <p>Need the right image size? Use the <a className="font-semibold text-primary" href="/tools/image-resizer">Social Media Image Resizer</a> to export a 1280×720 YouTube thumbnail.</p>
        </>
      }
    >
      <AiListTool
        tool="thumbnail"
        submitLabel="Generate thumbnail text"
        resultTitle="Thumbnail text ideas"
        copyAllSeparator={"\n"}
        fields={[{ name: "topic", label: "Video topic", type: "textarea", placeholder: "e.g. I tried waking up at 5am for 30 days" }]}
      />
    </ToolPage>
  );
}
