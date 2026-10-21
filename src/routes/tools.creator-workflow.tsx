import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { AI_PRIVACY, ToolPage } from "@/components/page";
import { WorkflowTool } from "@/components/workflow-tool";

export const Route = createFileRoute("/tools/creator-workflow")({
  head: () => seo("Creator Workflow — Hook, Caption, Hashtags & Thumbnail Text in One | CreatorKit Studio", "Enter one topic and get a complete short-form content package: an opening hook, caption, relevant hashtags and thumbnail text."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Creator Workflow"
      intro="One topic in, a complete post package out. Get a hook, caption, hashtags and thumbnail text that work together."
      privacy={AI_PRIVACY}
      guide={
        <>
          <h2>Why use a single workflow?</h2>
          <p>When your hook, caption and thumbnail are written separately, they can drift apart. Generating them together keeps one clear message across every part of your post, which helps viewers understand what they're getting.</p>
          <h2>A simple posting routine</h2>
          <ul>
            <li>Generate a package and pick the hook you'll say on camera.</li>
            <li>Record, then add the thumbnail text to your cover.</li>
            <li>Paste the caption and hashtags, then edit to match your voice.</li>
          </ul>
          <p>Hashtags are chosen for relevance to your topic. We don't have live trend data, so check current activity in each app.</p>
        </>
      }
    >
      <WorkflowTool />
    </ToolPage>
  );
}
