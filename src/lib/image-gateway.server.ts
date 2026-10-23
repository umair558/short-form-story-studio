export const POLLINATIONS_MODEL = "tongyi-mai/z-image-turbo";

/** One generation request only: no retries, enhancement calls or provider fallback. */
export function generateImagePollinations(apiKey: string, prompt: string, width: number, height: number) {
  const url = new URL(`https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}`);
  url.search = new URLSearchParams({ model: POLLINATIONS_MODEL, width: String(width), height: String(height), seed: "-1" }).toString();
  return fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
    redirect: "error",
  });
}

/** Only the safe message is returned; raw responses can contain credential or account details. */
export function pollinationsError(status: number, payload: unknown, apiKey: string): string {
  const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const error = data["error"] && typeof data["error"] === "object" ? data["error"] as Record<string, unknown> : {};
  const raw = typeof error["message"] === "string" ? error["message"] : typeof data["error"] === "string" ? data["error"] : typeof data["message"] === "string" ? data["message"] : "";
  const safe = raw.split(apiKey).join("[redacted]").replace(/(?:sk_|pk_)[a-zA-Z0-9_-]+/g, "[redacted]").slice(0, 700);
  return `Pollinations (${status}): ${safe || ({ 401: "Invalid or missing API key.", 402: "Insufficient Pollen balance or key budget.", 403: "Access denied. Check the key's model permissions.", 429: "Rate limit reached. Wait before starting a new request." } as Record<number, string>)[status] || "Image request failed; no image was generated."}`;
}
