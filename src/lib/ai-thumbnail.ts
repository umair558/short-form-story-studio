import { z } from "zod";

export const THUMBNAIL_STYLES = ["Gaming", "Cinematic", "Horror", "Viral", "Professional"] as const;
export const THUMBNAIL_EFFECTS = ["Fire", "Neon glow", "Smoke", "Sparks", "Dramatic lighting", "Motion blur"] as const;
export const thumbnailInput = z.object({
  prompt: z.string().trim().min(10, "Describe your thumbnail in at least 10 characters.").max(1500),
  aspectRatio: z.enum(["16:9", "9:16"]),
  style: z.enum(THUMBNAIL_STYLES),
  text: z.string().trim().max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  effects: z.array(z.enum(THUMBNAIL_EFFECTS)).max(THUMBNAIL_EFFECTS.length),
});
export type ThumbnailInput = z.infer<typeof thumbnailInput>;
export const GEMINI_IMAGE_MODEL = "gemini-nano-banana-2.1";

export function thumbnailRequest(input: ThumbnailInput) {
  return {
    model: GEMINI_IMAGE_MODEL,
    store: false,
    input: `Create one finished ${input.aspectRatio === "16:9" ? "YouTube thumbnail" : "YouTube Shorts cover"}. Creative brief: ${input.prompt}\nVisual style: ${input.style}. Accent color: ${input.color}. Effects: ${input.effects.join(", ") || "none"}. Strong focal subject, crisp details, professional composition, uncluttered, no fake badges or statistics. ${input.text ? `Render exactly this headline in large readable text, fully inside the frame with generous margins: ${JSON.stringify(input.text)}. No other text.` : "Do not include any text, captions or lettering."}`,
    response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: input.aspectRatio, image_size: "2K" },
  };
}

const responseSchema = z.object({
  output_image: z.object({ data: z.string().min(1), mime_type: z.string().optional() }).optional(),
  outputs: z.array(z.object({ type: z.string(), data: z.string().optional(), mime_type: z.string().optional(), text: z.string().optional() })).optional(),
});

export function readThumbnailResponse(body: unknown): { ok: true; data: string; mimeType: "image/jpeg" | "image/png" } | { ok: false; error: string } {
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) return { ok: false, error: "Google returned an unreadable response. No image was generated." };
  const image = parsed.data.output_image ?? parsed.data.outputs?.find((part) => part.type === "image");
  if (!image?.data) return { ok: false, error: "Google did not return an image. The request may have been declined by its safety filters. No thumbnail was generated." };
  try {
    const bytes = atob(image.data);
    const jpeg = bytes.charCodeAt(0) === 255 && bytes.charCodeAt(1) === 216 && bytes.charCodeAt(2) === 255;
    const png = bytes.startsWith("\x89PNG\r\n\x1a\n");
    if (!jpeg && !png) return { ok: false, error: "Google returned invalid image data. No thumbnail was generated." };
    return { ok: true, data: image.data, mimeType: jpeg ? "image/jpeg" : "image/png" };
  } catch {
    return { ok: false, error: "Google returned invalid image data. No thumbnail was generated." };
  }
}