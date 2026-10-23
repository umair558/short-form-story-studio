import { afterEach, describe, expect, it, vi } from "vitest";
import { generateImagePollinations, POLLINATIONS_MODEL, pollinationsError } from "@/lib/image-gateway.server";

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
    expect(url.searchParams.get("seed")).toBe("-1");
    expect(url.searchParams.has("key")).toBe(false);
    expect(options.headers.Authorization).toBe("Bearer test-credential");
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
});