import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PLATFORMS } from "@/lib/tools";
import { AI_PRIVACY, ToolPage } from "@/components/page";
import { AiListTool } from "@/components/ai-list-tool";

export const Route = createFileRoute("/tools/content-ideas")({
  head: () => seo("Content Idea Generator for Creators | CreatorKit Studio", "Beat creator's block with eight specific short-form video ideas for your niche on TikTok, Instagram Reels or YouTube Shorts."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Content Idea Generator"
      intro="Tell us your niche and platform and get eight specific video ideas, each with a suggested format."
      privacy={AI_PRIVACY}
      guide={
        <>
          <h2>Turning ideas into a content plan</h2>
          <p>Consistency is easier when you have a list of ideas ready. Generate a batch, keep the ones that fit your style, and group them into series — viewers often follow creators for repeatable formats.</p>
          <ul>
            <li><strong>Be specific about your niche.</strong> “Vegan meal prep for runners” gives better ideas than “food”.</li>
            <li><strong>Remix formats.</strong> Tutorials, myths vs. facts, day-in-the-life and before/after work in almost every niche.</li>
            <li><strong>Check your comments.</strong> Questions from your audience are often the best ideas.</li>
          </ul>
        </>
      }
    >
      <AiListTool
        tool="ideas"
        submitLabel="Generate ideas"
        resultTitle="Content ideas"
        copyAllSeparator={"\n"}
        fields={[
          { name: "niche", label: "Your niche", type: "text", maxLength: 120, placeholder: "e.g. Budget travel in Southeast Asia" },
          { name: "platform", label: "Platform", type: "select", options: PLATFORMS },
        ]}
      />
    </ToolPage>
  );
}
