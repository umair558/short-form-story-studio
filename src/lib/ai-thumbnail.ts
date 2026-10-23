import { z } from "zod";

export const THUMBNAIL_STYLES = ["Gaming", "MrBeast-style", "Cinematic", "Tech", "Vlog", "Documentary"] as const;
export const THUMBNAIL_EFFECTS = ["Fire", "Neon glow", "Smoke", "Sparks", "Dramatic lighting", "Motion blur"] as const;
export type ThumbnailStyle = (typeof THUMBNAIL_STYLES)[number];

export const thumbnailInput = z.object({
  prompt: z.string().trim().min(10, "Describe your thumbnail in at least 10 characters.").max(1500),
  aspectRatio: z.enum(["16:9", "9:16"]),
  style: z.enum(THUMBNAIL_STYLES),
  text: z.string().trim().max(60),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  effects: z.array(z.enum(THUMBNAIL_EFFECTS)).max(THUMBNAIL_EFFECTS.length),
});
export type ThumbnailInput = z.infer<typeof thumbnailInput>;

/** Exact output pixels. Both sizes are valid for the image model (multiples of 16, ≥ 655,360 px). */
export function thumbnailSize(aspectRatio: ThumbnailInput["aspectRatio"]) {
  return aspectRatio === "16:9" ? { width: 1280, height: 720 } : { width: 720, height: 1280 };
}

const STYLE_DIRECTION: Record<ThumbnailStyle, string> = {
  Gaming: "high-energy esports gaming key art, dynamic action pose, glowing rim lights, intense atmosphere",
  "MrBeast-style": "bright, ultra-saturated high-energy challenge-video look, huge expressive reaction face, bold simple composition, strong subject cut-out with white outline, big stakes visual",
  Cinematic: "blockbuster movie-poster look, anamorphic lighting, teal-and-orange grade, epic scale, shallow depth of field",
  Tech: "sleek modern tech-review look, clean studio lighting, glossy product hero shot, futuristic accents",
  Vlog: "warm authentic lifestyle vlog look, natural golden-hour light, friendly expressive person, inviting setting",
  Documentary: "serious investigative documentary look, moody low-key lighting, realistic textures, dramatic contrast",
};

export function thumbnailPrompt(input: ThumbnailInput) {
  const format = input.aspectRatio === "16:9" ? "YouTube video thumbnail, 16:9 landscape" : "YouTube Shorts cover, 9:16 portrait, key subject centered";
  const effects = input.effects.length ? ` Visual effects: ${input.effects.join(", ")}.` : "";
  const text = input.text
    ? ` Include exactly this headline as huge, bold, thick sans-serif lettering with a strong outline and drop shadow, perfectly spelled and fully inside the frame with safe margins: ${JSON.stringify(input.text.toUpperCase())}. No other words.`
    : " Do not add any text, letters, logos or watermarks.";
  return `A premium, click-worthy ${format}. Subject: ${input.prompt}. Style: ${STYLE_DIRECTION[input.style]}. Cinematic lighting, professional composition with one clear focal point, vibrant colors with ${input.color} as the accent color, realistic high-detail textures, sharp focus, high contrast, uncluttered background.${effects}${text} No fake badges, view counts or UI elements.`;
}

/** Plain-language message for a gateway failure status. */
export function thumbnailErrorMessage(status: number, detail?: string): string {
  if (status === 402) return "AI image generation is paused because the site's AI credits are used up. The site owner needs to add credits, then you can try again.";
  if (status === 429) return "Too many images are being generated right now. Please wait a minute and try again.";
  if (status === 401) return "AI image generation is not configured on this site yet.";
  if (status === 403) return detail ? `AI image generation is not allowed for this site: ${detail}` : "AI image generation is not allowed for this site right now.";
  if (status === 400) return detail ? `The image request was rejected: ${detail}` : "The image request was rejected. Try describing your idea differently.";
  if (status >= 500) return "The image service is having trouble right now. Please try again in a few minutes.";
  return detail || "Image generation failed. No thumbnail was generated.";
}

/** Matches content-policy refusals so we can explain them instead of showing a generic error. */
export function isPolicyRefusal(message: string) {
  return /content_policy|moderation|safety|policy/i.test(message);
}
