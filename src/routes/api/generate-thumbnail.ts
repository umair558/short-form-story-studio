import { createFileRoute } from "@tanstack/react-router";
import { thumbnailInput, thumbnailPrompt, thumbnailSize } from "@/lib/ai-thumbnail";

function fail(status: number, error: string) {
  return Response.json({ error }, { status });
}

export const Route = createFileRoute("/api/generate-thumbnail")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin) return fail(403, "Thumbnail generation must be requested from this website.");
        const body: unknown = await request.json().catch(() => null);
        const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
        const parsed = thumbnailInput.safeParse(raw);
        if (!parsed.success) return fail(400, parsed.error.issues[0]?.message ?? "Please check your options.");
        const apiKey = process.env["POLLINATIONS_API_KEY"];
        if (!apiKey) return fail(401, "Pollinations API key is not configured on this site yet.");
        const { generateImagePollinations, pollinationsError, POLLINATIONS_MODEL } = await import("@/lib/image-gateway.server");
        const { width, height } = thumbnailSize(parsed.data.aspectRatio);
        let upstream: Response;
        try {
          upstream = await generateImagePollinations(apiKey, thumbnailPrompt(parsed.data), width, height);
        } catch {
          return fail(502, "Could not reach Pollinations. No fallback or automatic retry was used.");
        }
        const contentType = upstream.headers.get("Content-Type") ?? "";
        if (!upstream.ok) {
          const payload: unknown = contentType.includes("application/json") ? await upstream.json().catch(() => null) : null;
          return fail(upstream.status, pollinationsError(upstream.status, payload, apiKey));
        }
        if (!/image\/(png|jpeg|webp)/i.test(contentType) || !upstream.body) {
          return fail(502, "Pollinations returned no supported image. No thumbnail was generated.");
        }
        return new Response(upstream.body, { status: 200, headers: { "Content-Type": contentType, "Cache-Control": "no-store", "X-Image-Provider": "Pollinations", "X-Image-Model": POLLINATIONS_MODEL, "X-Content-Type-Options": "nosniff" } });
      },
    },
  },
});
