import { readThumbnailResponse, thumbnailRequest, type ThumbnailInput } from "./ai-thumbnail";

export async function generateGeminiThumbnail(input: ThumbnailInput, apiKey: string) {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(thumbnailRequest(input)),
    });
    const body: unknown = await response.json();
    if (!response.ok) {
      const error = body && typeof body === "object" && "error" in body ? body.error : null;
      const message = error && typeof error === "object" && "message" in error && typeof error.message === "string" ? error.message : "Google image generation is unavailable.";
      // No automatic retries: quota, billing, refusals and access problems require a fresh user action after repair.
      return { ok: false as const, error: message.replaceAll(apiKey, "[redacted]").slice(0, 1500), status: response.status };
    }
    return readThumbnailResponse(body);
  } catch {
    return { ok: false as const, error: "Could not reach Google image generation. No image was returned. Check your connection and try again later." };
  }
}