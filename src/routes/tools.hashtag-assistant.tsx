import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PLATFORMS } from "@/lib/tools";
import { AI_PRIVACY, ToolPage } from "@/components/page";
import { AiListTool } from "@/components/ai-list-tool";

export const Route = createFileRoute("/tools/hashtag-assistant")({
  head: () => seo("Hashtag Assistant — Relevant Hashtag Ideas | CreatorKit Studio", "Get relevant broad, mid-size and niche hashtag suggestions for TikTok, Reels and Shorts. Relevance-based, no fake trend claims."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Hashtag Assistant"
      intro="Describe your video and choose a platform to get a mix of broad and niche hashtag suggestions."
      privacy={AI_PRIVACY}
      guide={
        <>
          <h2>How to use hashtag suggestions</h2>
          <p><strong>These suggestions are based on relevance to your topic, not live trend data.</strong> We can't see what's trending right now, so we never label a hashtag as trending. Before posting, search a few tags in the app to check how active they are.</p>
          <ul>
            <li>Combine 1–2 broad tags with several specific ones that describe your exact content.</li>
            <li>Avoid unrelated popular tags — they can confuse recommendation systems about who your video is for.</li>
            <li>Platforms change how hashtags are used over time; captions and on-screen text matter too.</li>
          </ul>
        </>
      }
    >
      <AiListTool
        tool="hashtag"
        submitLabel="Suggest hashtags"
        resultTitle="Hashtag suggestions"
        copyAllSeparator=" "
        fields={[
          { name: "topic", label: "Video topic", type: "textarea", placeholder: "e.g. Beginner home workout without equipment" },
          { name: "platform", label: "Platform", type: "select", options: PLATFORMS },
        ]}
      />
    </ToolPage>
  );
}
