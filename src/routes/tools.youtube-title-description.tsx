import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { AI_PRIVACY, ToolPage } from "@/components/page";
import { YoutubeTool } from "@/components/youtube-tool";

export const Route = createFileRoute("/tools/youtube-title-description")({
  head: () => seo("YouTube Title & Description Generator — Free AI Tool | CreatorKit Studio", "Describe your video and get six honest, search-friendly YouTube titles, a structured description and tags you can copy straight into YouTube Studio."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="YouTube Title & Description Generator"
      intro="Describe your video, add any keywords, and get title options, a ready-to-paste description and tags."
      privacy={AI_PRIVACY}
      guide={
        <>
          <h2>How to use it</h2>
          <ul>
            <li>Describe what actually happens in the video — the more specific, the better the titles.</li>
            <li>Add 1–3 keywords people would type into YouTube search.</li>
            <li>Pick a style, generate, then copy the title, description and tags into YouTube Studio.</li>
          </ul>
          <h2>Example</h2>
          <p><strong>Input:</strong> "I tested 5 budget mechanical keyboards under $50 for a month", keywords "budget keyboard". <strong>You might get:</strong> "I Used 5 Budget Keyboards for 30 Days — Here's the Winner", plus a description with an "In this video:" list and tags like "budget mechanical keyboard".</p>
          <h2>Tips for better titles</h2>
          <p>Keep titles under about 70 characters so they aren't cut off in search. The character count under each title helps. Make sure the thumbnail and title tell the same story, and edit the description's timestamps to match your video.</p>
        </>
      }
      faq={[
        { q: "Will these titles rank my video first?", a: "No tool can guarantee rankings. The titles are written to be clear and keyword-relevant, which helps viewers and search understand your video." },
        { q: "Do I need to edit the description?", a: "Yes, review it. Replace the 00:00 timestamp placeholder with your real chapters and add any links you want to share." },
        { q: "Are the tags based on live search data?", a: "No. Tags are suggested for relevance to your topic; we don't have access to YouTube's search volume data." },
      ]}
    >
      <YoutubeTool />
    </ToolPage>
  );
}
