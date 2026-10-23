import { createParser } from "eventsource-parser";
import { flushSync } from "react-dom";

type ImagePayload = { type?: string; b64_json?: string; error?: { message?: string } };

/** Error carrying the HTTP status and a message that is already safe to show. */
export class ImageStreamError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

async function readError(res: Response) {
  const text = await res.text().catch(() => "");
  try {
    const json = JSON.parse(text) as { error?: string | { message?: string } };
    return typeof json.error === "string" ? json.error : (json.error?.message ?? text);
  } catch {
    return text;
  }
}

export async function streamImage(
  endpoint: string,
  input: Record<string, unknown>,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
  accessToken?: string,
): Promise<void> {
  const send = (stream: boolean) =>
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ ...input, stream }),
    });
  const res = await send(true);
  if (!res.ok || !res.body) throw new ImageStreamError(await readError(res), res.status);
  if (/image\/(png|jpeg|webp)/i.test(res.headers.get("Content-Type") ?? "")) {
    const blob = await res.blob();
    if (!blob.size) throw new ImageStreamError("Pollinations returned an empty image.");
    const url = URL.createObjectURL(blob);
    try {
      onFrame(url, true);
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
    return;
  }

  let sawCompleted = false;
  let sawAnyEvent = false;
  let streamError: string | undefined;
  const parser = createParser({
    onEvent(event) {
      let payload: ImagePayload | undefined;
      try {
        payload = JSON.parse(event.data) as ImagePayload;
      } catch {
        payload = undefined;
      }
      if (event.event === "error" || payload?.type === "error") {
        sawAnyEvent = true;
        streamError = payload?.error?.message ?? "Image generation failed";
        return;
      }
      const type = event.event || payload?.type;
      if (type !== "image_generation.partial_image" && type !== "image_generation.completed")
        return;
      sawAnyEvent = true;
      if (!payload?.b64_json) {
        streamError = "Image event contained no image";
        return;
      }
      const isFinal = type === "image_generation.completed";
      // React batches callbacks from coalesced SSE events unless each frame is committed here.
      flushSync(() => onFrame(`data:image/png;base64,${payload.b64_json}`, isFinal));
      if (isFinal) sawCompleted = true;
    },
  });
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      let chunk: ReadableStreamReadResult<string>;
      try {
        chunk = await reader.read();
      } catch (error) {
        if (sawAnyEvent || (error instanceof Error && error.name === "AbortError")) throw error;
        break;
      }
      if (chunk.done) break;
      parser.feed(chunk.value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  if (streamError) throw new ImageStreamError(streamError);
  if (!sawAnyEvent) {
    throw new ImageStreamError("The image service returned no image. No automatic retry was made.");
  }
  if (!sawCompleted)
    throw new ImageStreamError("The image stopped before it finished. No thumbnail was generated.");
}
