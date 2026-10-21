import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PLATFORMS } from "@/lib/tools";
import { AI_PRIVACY, ToolPage } from "@/components/page";
import { AiListTool } from "@/components/ai-list-tool";

export const Route = createFileRoute("/tools/bio-generator")({
  head: () => seo("Creator Bio Generator for TikTok & Instagram | CreatorKit Studio", "Write a short, clear profile bio that explains what you post and why to follow. Choose a style and get five options."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Bio Generator"
      intro="Describe what you create, pick a style, and get five short bios that fit platform character limits."
      privacy={AI_PRIVACY}
      guide={
        <>
          <h2>What makes a good creator bio</h2>
          <p>Your bio is the deciding moment when someone visits your profile after a video. In one or two lines it should answer: who is this, what do they post, and why should I follow?</p>
          <ul>
            <li><strong>Be concrete.</strong> “Easy 15-minute dinners” beats “food lover”.</li>
            <li><strong>Show your personality</strong> through word choice, not just emojis.</li>
            <li><strong>Mind the limits.</strong> TikTok bios are 80 characters; Instagram allows 150. Suggestions aim under 150 — trim for TikTok if needed.</li>
          </ul>
        </>
      }
    >
      <AiListTool
        tool="bio"
        submitLabel="Generate bios"
        resultTitle="Bio options"
        fields={[
          { name: "niche", label: "What you create", type: "textarea", maxLength: 200, placeholder: "e.g. Nurse sharing study tips and honest hospital life" },
          { name: "style", label: "Style", type: "select", options: ["Professional", "Playful", "Minimal", "Bold", "Warm"] },
          { name: "platform", label: "Platform", type: "select", options: PLATFORMS },
        ]}
      />
    </ToolPage>
  );
}
