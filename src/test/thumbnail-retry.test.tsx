import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AiThumbnailGenerator } from "@/components/ai-thumbnail-generator";
import { streamImage } from "@/lib/stream-image";

vi.mock("@/lib/stream-image", () => ({
  streamImage: vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  ImageStreamError: class extends Error {},
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("does not retry automatically and sends exactly one request for each manual Retry click", async () => {
  render(<AiThumbnailGenerator />);
  fireEvent.change(screen.getByLabelText("Your topic or thumbnail idea"), { target: { value: "A cinematic mountain landscape" } });
  fireEvent.click(screen.getByRole("button", { name: "Generate Thumbnail" }));
  const retry = await screen.findByRole("button", { name: "Retry" });
  expect(streamImage).toHaveBeenCalledTimes(1);
  fireEvent.click(retry);
  await waitFor(() => expect(streamImage).toHaveBeenCalledTimes(2));
  await screen.findByRole("button", { name: "Retry" });
  expect(streamImage).toHaveBeenCalledTimes(2);
});