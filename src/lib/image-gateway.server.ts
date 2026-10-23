export const POLLINATIONS_MODEL = "tongyi-mai/z-image-turbo";
let previousSeed: number | undefined;

/** Explicit supported seeds also change the URL, unlike the cached seed=-1 URL. */
function freshSeed() {
  const values = crypto.getRandomValues(new Uint32Array(1));
  let seed = (values[0] ?? 0) & 2147483647;
  if (seed === previousSeed) seed = (seed + 1) % 2147483648;
  previousSeed = seed;
  return seed;
}

/** One generation request only: no retries, enhancement calls or provider fallback. */
export function generateImagePollinations(apiKey: string, prompt: string, width: number, height: number) {
  const url = new URL(`https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}`);
  url.search = new URLSearchParams({ model: POLLINATIONS_MODEL, width: String(width), height: String(height), seed: String(freshSeed()) }).toString();
  return fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}`, "Cache-Control": "no-cache, no-store" },
    // Use HTTP headers and unique seeds: RequestInit.cache depends on Worker compatibility flags.
    signal: AbortSignal.timeout(180_000),
    // Workers reject redirect:"error" with an instant TypeError; "manual" is supported and 3xx is treated as failure.
    redirect: "manual",
  });
}

export function pollinationsConnectionError(error: unknown): { status: number; code: string; message: string } {
  const name = error instanceof Error || error instanceof DOMException ? error.name : "UnknownError";
  const cause = error instanceof Error ? (error as Error & { cause?: { code?: unknown } }).cause : undefined;
  const code = typeof cause?.code === "string" && /^[A-Z0-9_]{1,60}$/.test(cause.code) ? cause.code : name;
  const timeout = name === "TimeoutError" || name === "AbortError";
  return { status: timeout ? 504 : 502, code, message: timeout
    ? "Pollinations timed out after 3 minutes. No image was received. A provider charge may still apply; check your usage before choosing Retry. No automatic retry or fallback was used."
    : "The connection to Pollinations failed before an image was received. Check your connection and try Retry manually. A provider charge may still apply. No automatic retry or fallback was used." };
}

/** Only the safe message is returned; raw responses can contain credential or account details. */
export function pollinationsError(status: number, payload: unknown, apiKey: string): string {
  const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const error = data["error"] && typeof data["error"] === "object" ? data["error"] as Record<string, unknown> : {};
  const raw = typeof error["message"] === "string" ? error["message"] : typeof data["error"] === "string" ? data["error"] : typeof data["message"] === "string" ? data["message"] : "";
  const safe = raw.split(apiKey).join("[redacted]").replace(/(?:sk_|pk_)[a-zA-Z0-9_-]+/g, "[redacted]").slice(0, 700);
  return `Pollinations (${status}): ${safe || ({ 401: "Invalid or missing API key.", 402: "Insufficient Pollen balance or key budget.", 403: "Access denied. Check the key's model permissions.", 429: "Rate limit reached. Wait before starting a new request." } as Record<number, string>)[status] || "Image request failed; no image was generated."}`;
}
