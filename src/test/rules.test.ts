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
    expect(filterTools("", "Image").map((t) => t.slug)).toEqual(["ai-thumbnail-generator", "image-resizer", "image-compressor", "youtube-thumbnail-maker"]);
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

import { calendarInput } from "@/lib/ai.functions";
import { calendarToCsv, dateForDay } from "@/lib/calendar";
import { coverSource } from "@/lib/thumbnail";

describe("new tools", () => {
  it("calendar accepts 7, 14 and 30 days only", () => {
    for (const days of [7, 14, 30]) expect(calendarInput.safeParse({ niche: "fitness", platform: "TikTok", days }).success).toBe(true);
    expect(calendarInput.safeParse({ niche: "fitness", platform: "TikTok", days: 10 }).success).toBe(false);
  });
  it("day 30 from 2026-10-21 is 2026-11-19", () => expect(dateForDay("2026-10-21", 30)).toBe("2026-11-19"));
  it("CSV escapes commas and quotes", () => {
    const csv = calendarToCsv([{ day: 1, theme: "Tips", format: "Talk", idea: 'Say "hi", wave', hook: "Go" }], "2026-01-01");
    expect(csv.split("\n")[1]).toBe('1,2026-01-01,Tips,Talk,"Say ""hi"", wave",Go');
  });
  it("thumbnail cover-crops a square photo to 16:9 centered", () => {
    const r = coverSource(1000, 1000, 1, 0, 0);
    expect(r.sw).toBeCloseTo(1000);
    expect(r.sh).toBeCloseTo(562.5);
    expect(r.sy).toBeCloseTo(218.75);
  });
  it("finds the calendar by searching 'month'", () => expect(filterTools("month", "All").map((t) => t.slug)).toContain("content-calendar"));
});
