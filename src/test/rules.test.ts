import { describe, expect, it } from "vitest";
import { fitRect, formatBytes, validateImageFile } from "@/lib/image";
import { filterTools } from "@/lib/tools";
import { listInput } from "@/lib/ai.functions";

describe("image rules", () => {
  it("cover crops a 2000x1000 image to a centered square", () => {
    const r = fitRect(2000, 1000, 1080, 1080, "cover");
    expect(r.sw).toBeCloseTo(1000);
    expect(r.sx).toBeCloseTo(500);
  });
  it("contain fits 2000x1000 into 1080x1080 with vertical padding", () => {
    const r = fitRect(2000, 1000, 1080, 1080, "contain");
    expect(r.dh).toBe(540);
    expect(r.dy).toBe(270);
  });
  it("rejects files over 25 MB", () => {
    const f = { type: "image/png", size: 26 * 1024 * 1024 } as File;
    expect(validateImageFile(f)).toMatch(/25 MB/);
  });
  it("rejects unsupported types", () => {
    expect(validateImageFile({ type: "application/pdf", size: 10 } as File)).toMatch(/Unsupported/);
  });
  it("formats sizes", () => expect(formatBytes(1536)).toBe("1.5 KB"));
});

describe("tool search", () => {
  it("filters image tools by category", () => {
    expect(filterTools("", "Image").map((t) => t.slug)).toEqual(["image-resizer", "image-compressor"]);
  });
  it("finds hashtag tool by query", () => {
    expect(filterTools("hashtag", "All").map((t) => t.slug)).toContain("hashtag-assistant");
  });
});

describe("AI input validation", () => {
  it("rejects a 1-character topic", () => {
    expect(listInput.safeParse({ tool: "hook", topic: "a", platform: "TikTok" }).success).toBe(false);
  });
  it("accepts X as a platform", () => {
    expect(listInput.safeParse({ tool: "hook", topic: "cooking", platform: "X" }).success).toBe(true);
  });
  it("rejects unknown platforms", () => {
    expect(listInput.safeParse({ tool: "hook", topic: "cooking", platform: "MySpace" }).success).toBe(false);
  });
});

describe("social media filter", () => {
  it("includes the hook generator but not the compressor", () => {
    const s = filterTools("", "Social Media").map((t) => t.slug);
    expect(s).toContain("hook-generator");
    expect(s).not.toContain("image-compressor");
  });
});
