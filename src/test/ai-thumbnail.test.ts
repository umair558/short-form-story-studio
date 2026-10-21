import { describe, expect, it } from "vitest";
import { thumbnailInput, thumbnailRequest, readThumbnailResponse } from "@/lib/ai-thumbnail";

const input = { prompt: "Epic PUBG gaming thumbnail with fire effects and a character holding M416", aspectRatio: "16:9" as const, style: "Gaming" as const, text: "FINAL ZONE", color: "#2563eb", effects: ["Fire" as const] };
describe("Gemini thumbnail rules", () => {
  it("supports YouTube 16:9", () => expect(thumbnailRequest(thumbnailInput.parse(input)).response_format.aspect_ratio).toBe("16:9"));
  it("supports Shorts 9:16", () => expect(thumbnailRequest(thumbnailInput.parse({ ...input, aspectRatio: "9:16" })).response_format.aspect_ratio).toBe("9:16"));
  it("supports all five requested styles", () => { for (const style of ["Gaming", "Cinematic", "Horror", "Viral", "Professional"]) expect(thumbnailInput.parse({ ...input, style }).style).toBe(style); });
  it("requests genuine 2K generation", () => expect(thumbnailRequest(input).response_format.image_size).toBe("2K"));
  it("never treats a text-only reply as an image", () => expect(readThumbnailResponse({ outputs: [{ type: "text", text: "Here is your thumbnail" }] }).ok).toBe(false));
  it("rejects invalid image bytes", () => expect(readThumbnailResponse({ output_image: { data: btoa("not an image") } }).ok).toBe(false));
  it("accepts JPEG signature data for browser decoding", () => expect(readThumbnailResponse({ output_image: { data: btoa("\xff\xd8\xffexample") } }).ok).toBe(true));
});