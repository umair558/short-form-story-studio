import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PLATFORMS } from "@/lib/tools";
import { AI_PRIVACY, ToolPage } from "@/components/page";
import { AiListTool } from "@/components/ai-list-tool";

export const Route = createFileRoute("/tools/hook-generator")({
  head: () => seo("Viral Hook Generator — Opening Lines for Short Videos | CreatorKit Studio", "Get eight opening-hook ideas for TikTok, Reels and Shorts in different styles: questions, bold claims, curiosity gaps and more."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Viral Hook Generator"
      intro="Enter your video topic and get eight opening lines in different styles to test in your first few seconds."
      privacy={AI_PRIVACY}
      guide={
        <>
          <h2>Why the hook matters</h2>
          <p>The hook is the first thing a viewer hears or reads. It should promise something specific — a result, a surprise or an answer — that the rest of the video delivers.</p>
          <ul>
            <li><strong>Question hooks</strong> invite viewers to find the answer.</li>
            <li><strong>Bold claims</strong> work when you can back them up in the video.</li>
            <li><strong>Curiosity gaps</strong> hint at something without giving it away.</li>
            <li><strong>Relatable pain</strong> makes viewers feel seen.</li>
          </ul>
          <p>No tool can guarantee a video goes viral. Use these as starting points, say them out loud, and pick the one that feels natural. Keep the promise honest — misleading hooks hurt retention.</p>
        </>
      }
    >
      <AiListTool
        tool="hook"
        submitLabel="Generate hooks"
        resultTitle="Hook ideas"
        copyAllSeparator={"\n"}
        fields={[
          { name: "topic", label: "Video topic", type: "textarea", placeholder: "e.g. How I saved $2,000 in 3 months on a small salary" },
          { name: "platform", label: "Platform", type: "select", options: PLATFORMS },
        ]}
      />
    </ToolPage>
  );
}
