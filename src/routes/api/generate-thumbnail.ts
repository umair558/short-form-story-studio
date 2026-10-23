import { createFileRoute } from "@tanstack/react-router";
import { thumbnailInput, thumbnailPrompt, thumbnailSize, thumbnailErrorMessage } from "@/lib/ai-thumbnail";

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
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return fail(401, thumbnailErrorMessage(401));
        const { generateImage, imageSettings } = await import("@/lib/image-gateway.server");
        const { width, height } = thumbnailSize(parsed.data.aspectRatio);
        const stream = raw["stream"] !== false;
        let upstream: Response;
        try {
          upstream = await generateImage({ ...imageSettings, apiKey }, thumbnailPrompt(parsed.data), `${width}x${height}`, stream);
        } catch {
          return fail(502, "Could not reach the image service. Please try again later.");
        }
        if (!upstream.ok) {
          const detail = await upstream.json().then((j: { error?: { message?: string } | string; message?: string }) => (typeof j.error === "string" ? j.error : j.error?.message ?? j.message)).catch(() => undefined);
          console.error("Thumbnail generation failed", upstream.status, detail);
          return fail(upstream.status, thumbnailErrorMessage(upstream.status, detail?.slice(0, 300)));
        }
        return new Response(upstream.body, {
          status: upstream.status,
          headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json", "Cache-Control": "no-cache, no-transform" },
        });
      },
    },
  },
});
