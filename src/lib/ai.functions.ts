import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
