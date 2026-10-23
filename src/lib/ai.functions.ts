import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const platform = z.enum(["TikTok", "Instagram Reels", "YouTube Shorts", "X"]);
const text = (max: number) => z.string().trim().min(2, "Please enter at least 2 characters.").max(max);

export const listInput = z.discriminatedUnion("tool", [
  z.object({ tool: z.literal("caption"), topic: text(300), platform, tone: z.enum(["Friendly", "Funny", "Professional", "Inspirational", "Bold", "Educational"]) }),
  z.object({ tool: z.literal("hook"), topic: text(300), platform }),
  z.object({ tool: z.literal("hashtag"), topic: text(300), platform }),
  z.object({ tool: z.literal("ideas"), niche: text(120), platform }),
  z.object({ tool: z.literal("bio"), niche: text(200), style: z.enum(["Professional", "Playful", "Minimal", "Bold", "Warm"]), platform }),
  z.object({ tool: z.literal("thumbnail"), topic: text(300) }),
]);
export type ListInput = z.infer<typeof listInput>;

const RULES =
  "You help short-form video creators. Write in clear, natural English. No emojis unless they suit the platform. Never claim anything is trending or guaranteed to go viral. Never invent statistics.";

function buildPrompt(d: ListInput): string {
  switch (d.tool) {
    case "caption":
      return `Write 5 distinct ${d.platform} captions about: "${d.topic}". Tone: ${d.tone}. Each 1–3 short sentences with a soft call to action. Do not include hashtags.`;
    case "hook":
      return `Write 8 opening hooks (first spoken line, under 15 words each) for a ${d.platform} video about: "${d.topic}". Vary the styles: question, bold claim, curiosity gap, relatable pain, quick promise.`;
    case "hashtag":
      return `Suggest 20 relevant ${d.platform} hashtags for a video about: "${d.topic}". Mix broad, mid-size and niche tags. Each item is a single hashtag starting with #, no spaces. Relevance only; you have no live trend data.`;
    case "ideas":
      return `Give 8 specific, practical ${d.platform} video ideas for a creator in the "${d.niche}" niche. Each item: a short title, then " — " and one sentence describing the format.`;
    case "bio":
      return `Write 5 ${d.platform} profile bios for a creator about "${d.niche}". Style: ${d.style}. Each under 150 characters, say what they post and why to follow.`;
    case "thumbnail":
      return `Write 10 thumbnail/cover text overlays for a video about: "${d.topic}". Each 2–5 words, high contrast wording, no punctuation clutter, no clickbait lies.`;
  }
}

export const generateList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => listInput.parse(input))
  .handler(async ({ data }) => {
    const { generateStructured } = await import("./ai.server");
    const res = await generateStructured(z.object({ items: z.array(z.string()) }), RULES, buildPrompt(data));
    if (!res.ok) return res;
    const items = res.data.items.map((s) => s.trim()).filter(Boolean).slice(0, 25);
    if (!items.length) return { ok: false as const, code: "empty", error: "No suggestions were returned. Please try again." };
    return { ok: true as const, data: { items } };
  });

export const workflowInput = z.object({
  topic: text(300),
  platform,
  contentType: z.enum(["Short video", "Tutorial", "Story / vlog", "Product review", "Text post"]).default("Short video"),
});

export const generateWorkflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => workflowInput.parse(input))
  .handler(async ({ data }) => {
    const { generateStructured } = await import("./ai.server");
    const schema = z.object({
      hook: z.string(),
      caption: z.string(),
      hashtags: z.array(z.string()),
      thumbnailText: z.string(),
    });
    const res = await generateStructured(
      schema,
      RULES,
      `Create a complete ${data.platform} content package (format: ${data.contentType}) about: "${data.topic}". hook: one opening line under 15 words. caption: 2–3 sentences with a soft call to action, no hashtags. hashtags: 10 relevant hashtags each starting with #. thumbnailText: 2–5 words.`,
    );
    if (!res.ok) return res;
    return {
      ok: true as const,
      data: { ...res.data, hashtags: res.data.hashtags.map((h) => h.trim()).filter(Boolean).slice(0, 15) },
    };
  });

export const youtubeInput = z.object({
  topic: text(400),
  keywords: z.string().trim().max(200).default(""),
  style: z.enum(["Educational", "Entertaining", "Story-driven", "Review", "Tutorial"]).default("Educational"),
});

export const generateYoutube = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => youtubeInput.parse(input))
  .handler(async ({ data }) => {
    const { generateStructured } = await import("./ai.server");
    const schema = z.object({ titles: z.array(z.string()), description: z.string(), tags: z.array(z.string()) });
    const res = await generateStructured(
      schema,
      RULES,
      `Create YouTube metadata for a ${data.style.toLowerCase()} video about: "${data.topic}".${data.keywords ? ` Work in these keywords naturally: ${data.keywords}.` : ""} titles: 6 distinct titles, each under 70 characters, honest (no clickbait lies). description: 120–250 words: a 2-line opening summary with the main keyword, a short paragraph on what viewers learn, a "In this video:" list of 3–5 points as lines starting with "- ", and a closing call to subscribe. Add timestamp placeholders only as "00:00 Intro". tags: 12 relevant search tags without # symbols.`,
    );
    if (!res.ok) return res;
    const titles = res.data.titles.map((s) => s.trim()).filter(Boolean).slice(0, 10);
    if (!titles.length || !res.data.description.trim()) return { ok: false as const, code: "empty", error: "No result was returned. Please try again." };
    return { ok: true as const, data: { titles, description: res.data.description.trim(), tags: res.data.tags.map((t) => t.replace(/^#/, "").trim()).filter(Boolean).slice(0, 20) } };
  });

export const calendarInput = z.object({
  niche: text(200),
  platform,
  days: z.union([z.literal(7), z.literal(14), z.literal(30)]),
  goal: z.enum(["Grow followers", "Build engagement", "Sell a product", "Build authority"]).default("Grow followers"),
});

export type CalendarDay = { day: number; theme: string; format: string; idea: string; hook: string };

export const generateCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => calendarInput.parse(input))
  .handler(async ({ data }) => {
    const { generateStructured } = await import("./ai.server");
    const schema = z.object({
      days: z.array(z.object({ day: z.number(), theme: z.string(), format: z.string(), idea: z.string(), hook: z.string() })),
    });
    const res = await generateStructured(
      schema,
      RULES,
      `Plan a ${data.days}-day ${data.platform} content calendar for a creator in the "${data.niche}" niche. Goal: ${data.goal}. Return exactly ${data.days} entries, day 1 to ${data.days}, one post per day. Rotate content pillars (educational, entertaining, personal, community, promotional at most once a week). theme: 1–3 word pillar name. format: e.g. "Talking head", "Tutorial", "Carousel", "Behind the scenes", "Q&A", "Duet/Stitch". idea: one specific sentence. hook: an opening line under 15 words. Keep each day different.`,
    );
    if (!res.ok) return res;
    const days = res.data.days.slice(0, data.days).map((d, i) => ({ ...d, day: i + 1 }));
    if (days.length < Math.min(data.days, 5)) return { ok: false as const, code: "empty", error: "The plan came back incomplete. Please try again." };
    return { ok: true as const, data: { days } };
  });
