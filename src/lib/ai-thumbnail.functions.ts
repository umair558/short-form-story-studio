import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { thumbnailInput } from "./ai-thumbnail";

export const generateThumbnail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => thumbnailInput.parse(input))
  .handler(async ({ data }) => {
    const request = getRequest();
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return { ok: false as const, error: "Thumbnail generation must be requested from this website." };
    }
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "Gemini image generation is not configured. The site owner needs to connect their Google AI Studio API key." };
    const { generateGeminiThumbnail } = await import("./ai-thumbnail.server");
    return generateGeminiThumbnail(data, apiKey);
  });