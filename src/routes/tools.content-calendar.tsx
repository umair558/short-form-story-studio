import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { AI_PRIVACY, ToolPage } from "@/components/page";
import { CalendarTool } from "@/components/calendar-tool";

export const Route = createFileRoute("/tools/content-calendar")({
  head: () => seo("Social Media Content Calendar Generator — 7, 14 & 30-Day Plans | CreatorKit Studio", "Get a day-by-day posting plan for TikTok, Reels, Shorts or X with content pillars, formats, ideas and hooks. Copy it or export to CSV for Sheets or Excel."),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Social Media Content Calendar"
      intro="Choose 7, 14 or 30 days, tell us your niche and goal, and get a dated posting plan with an idea and hook for every day."
      privacy={AI_PRIVACY}
      guide={
        <>
          <h2>How to use it</h2>
          <ul>
            <li>Pick a plan length: a week to test, two weeks to build a habit, or a full month.</li>
            <li>Enter your niche and main goal, choose your platform and a start date.</li>
            <li>Copy the plan, or download the CSV and open it in Google Sheets, Excel or Notion.</li>
          </ul>
          <h2>Example</h2>
          <p><strong>Niche:</strong> "home workouts for busy parents", goal "Grow followers". <strong>Day 1</strong> might be an "Educational · Tutorial" post: a 5-minute no-equipment routine, with the hook "No gym, no time? Try this before the kids wake up."</p>
          <h2>Making the plan work</h2>
          <p>Treat the calendar as a starting point. Batch-film similar formats together, swap days around to fit your life, and repeat the themes that get the best response.</p>
        </>
      }
      faq={[
        { q: "How long does a 30-day plan take?", a: "Usually 20–60 seconds, because the AI writes a unique idea and hook for every day." },
        { q: "Is the calendar saved?", a: "No. Nothing is stored on our side, so copy it or download the CSV before leaving the page." },
        { q: "Can I post more than once a day?", a: "The plan has one post per day. For more, generate a second plan with a different goal and combine them." },
      ]}
    >
      <CalendarTool />
    </ToolPage>
  );
}
