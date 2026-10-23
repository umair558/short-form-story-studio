import { afterEach, describe, expect, it, vi } from "vitest";
import { generateImagePollinations, POLLINATIONS_MODEL, pollinationsError, pollinationsConnectionError } from "@/lib/image-gateway.server";

afterEach(() => vi.unstubAllGlobals());
describe("Pollinations thumbnail integration", () => {
  it("uses one real image endpoint request with exact YouTube dimensions and server-header authentication", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("image", { headers: { "Content-Type": "image/png" } }));
    vi.stubGlobal("fetch", fetchMock);
    await generateImagePollinations("test-credential", "A cinematic mountain", 1280, 720);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    if (!call) throw new Error("No generation request was made");
    const [url, options] = call;
    expect(url.origin).toBe("https://gen.pollinations.ai");
    expect(decodeURIComponent(url.pathname)).toBe("/image/A cinematic mountain");
    expect(url.searchParams.get("model")).toBe("tongyi-mai/z-image-turbo");
    expect(POLLINATIONS_MODEL).toBe("tongyi-mai/z-image-turbo");
    expect(url.searchParams.get("width")).toBe("1280");
    expect(url.searchParams.get("height")).toBe("720");
    const seed = Number(url.searchParams.get("seed"));
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThanOrEqual(2147483647);
    expect(url.searchParams.has("key")).toBe(false);
    expect(options.headers.Authorization).toBe("Bearer test-credential");
  });
  it("changes the supported seed and URL for regeneration even if random values repeat", async () => {
    vi.stubGlobal("crypto", { getRandomValues: (values: Uint32Array) => { values[0] = 123456; return values; } });
    const fetchMock = vi.fn().mockResolvedValue(new Response("image"));
    vi.stubGlobal("fetch", fetchMock);
    await generateImagePollinations("test-credential", "Same topic", 1280, 720);
    await generateImagePollinations("test-credential", "Same topic", 1280, 720);
    const first = fetchMock.mock.calls[0];
    const second = fetchMock.mock.calls[1];
    if (!first || !second) throw new Error("Missing generation calls");
    expect(first[0].searchParams.get("seed")).toBe("123456");
    expect(second[0].searchParams.get("seed")).toBe("123457");
    expect(second[0].href).not.toBe(first[0].href);
    expect(second[1].cache).toBeUndefined();
    expect(second[1].signal).toBeInstanceOf(AbortSignal);
    expect(second[1].headers["Cache-Control"]).toBe("no-cache, no-store");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("never retries or calls a fallback after provider failure", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network failure"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(generateImagePollinations("test-credential", "Mountain", 1280, 720)).rejects.toThrow("network failure");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("preserves the provider error without leaking credentials", () => {
    expect(pollinationsError(403, { error: { message: "Model denied for test-credential" } }, "test-credential")).toBe("Pollinations (403): Model denied for [redacted]");
  });
  it("reports connection failures without exposing the key or raw exception", () => {
    const error = new TypeError("Failed fetch Bearer secret-test-key");
    const failure = pollinationsConnectionError(error);
    expect(failure.status).toBe(502);
    expect(failure.message).toContain("Retry manually");
    expect(JSON.stringify(failure)).not.toContain("secret-test-key");
  });
  it("reports timeouts without promising no charge or retrying", () => {
    const failure = pollinationsConnectionError(new DOMException("expired", "TimeoutError"));
    expect(failure.status).toBe(504);
    expect(failure.message).toContain("charge may still apply");
    expect(failure.message).toContain("No automatic retry or fallback");
  });
});