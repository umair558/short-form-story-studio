import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PLATFORMS } from "@/lib/tools";
import { AI_PRIVACY, ToolPage } from "@/components/page";
import { AiListTool } from "@/components/ai-list-tool";

export const Route = createFileRoute("/tools/caption-generator")({
  head: () => seo("AI Caption Generator for TikTok, Reels & Shorts — CreatorKit Studio", "Generate five platform-ready captions in your chosen tone. Free AI caption writer for short-form video creators."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="AI Caption Generator"
      intro="Describe your video, pick a platform and tone, and get five caption options you can copy in one tap."
      privacy={AI_PRIVACY}
      guide={
        <>
          <h2>Writing captions that work on short-form video</h2>
          <p>On TikTok, Reels and Shorts, most viewers decide within seconds whether to keep watching. A caption supports the video: it adds context, sets expectations and gives a reason to comment or save.</p>
          <ul>
            <li><strong>Lead with the payoff.</strong> The first line is often all people see before “more”.</li>
            <li><strong>Match your tone to your audience.</strong> Educational creators often do better with clarity; entertainment creators with personality.</li>
            <li><strong>End with a small ask.</strong> A question or “save this for later” invites interaction without sounding pushy.</li>
          </ul>
          <p>Captions are generated without hashtags so you can add your own — or use the Hashtag Assistant. Always edit suggestions so they sound like you.</p>
        </>
      }
    >
      <AiListTool
        tool="caption"
        submitLabel="Generate captions"
        resultTitle="Caption ideas"
        fields={[
          { name: "topic", label: "Video topic", type: "textarea", placeholder: "e.g. My 5-minute morning skincare routine for oily skin" },
          { name: "platform", label: "Platform", type: "select", options: PLATFORMS },
          { name: "tone", label: "Tone", type: "select", options: ["Friendly", "Funny", "Professional", "Inspirational", "Bold", "Educational"] },
        ]}
      />
    </ToolPage>
  );
}
