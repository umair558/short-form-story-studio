import { describe, expect, it } from "vitest";
import { thumbnailInput, thumbnailPrompt, thumbnailSize, thumbnailErrorMessage } from "@/lib/ai-thumbnail";

const input = { prompt: "Soldier holding a rifle in a burning battle zone", aspectRatio: "16:9" as const, style: "Gaming" as const, text: "FINAL ZONE", color: "#2563eb", effects: ["Fire" as const] };
describe("AI thumbnail rules", () => {
  it("defaults to a 1280x720 YouTube thumbnail", () => expect(thumbnailSize("16:9")).toEqual({ width: 1280, height: 720 }));
  it("Shorts covers are 720x1280", () => expect(thumbnailSize("9:16")).toEqual({ width: 720, height: 1280 }));
  it("offers exactly the six requested styles", () => {
    for (const style of ["Gaming", "MrBeast-style", "Cinematic", "Tech", "Vlog", "Documentary"]) expect(thumbnailInput.parse({ ...input, style }).style).toBe(style);
    expect(thumbnailInput.safeParse({ ...input, style: "Horror" }).success).toBe(false);
  });
  it("asks for the headline text exactly", () => expect(thumbnailPrompt(input)).toContain('"FINAL ZONE"'));
  it("forbids text when no headline is given", () => expect(thumbnailPrompt({ ...input, text: "" })).toContain("Do not add any text"));
  it("explains exhausted credits", () => expect(thumbnailErrorMessage(402)).toMatch(/credits/));
  it("explains rate limits", () => expect(thumbnailErrorMessage(429)).toMatch(/wait/));
});
