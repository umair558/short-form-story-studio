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
        const apiKey = process.env["AGENTROUTER_API_KEY"];
        if (!apiKey) return fail(401, "AI image generation is not configured on this site yet.");
        const { generateImageAgentRouter, agentRouterSettings } = await import("@/lib/image-gateway.server");
        const { width, height } = thumbnailSize(parsed.data.aspectRatio);
        let upstream: Response;
        try {
          upstream = await generateImageAgentRouter({ ...agentRouterSettings, apiKey }, thumbnailPrompt(parsed.data), `${width}x${height}`);
        } catch {
          return fail(502, "Could not reach the image service. Please try again later.");
        }
        const contentType = upstream.headers.get("Content-Type") ?? "";
        if (!contentType.includes("application/json")) {
          // The provider answered with a web page (for example an access-verification
          // page) instead of an API response, so no image was generated.
          console.error("Image service returned a non-API response", upstream.status, contentType);
          return fail(502, "The image service did not accept the request (it returned a web page instead of an image). Please try again later.");
        }
        const json = (await upstream.json().catch(() => null)) as { data?: { b64_json?: string }[]; error?: { message?: string } | string; message?: string } | null;
        if (!upstream.ok) {
          const detail = json ? (typeof json.error === "string" ? json.error : json.error?.message ?? json.message) : undefined;
          console.error("Thumbnail generation failed", upstream.status, detail);
          return fail(upstream.status, thumbnailErrorMessage(upstream.status, detail?.slice(0, 300)));
        }
        const b64 = json?.data?.[0]?.b64_json;
        if (!b64) {
          console.error("Image service returned no image", JSON.stringify(json).slice(0, 300));
          return fail(502, "The image service returned no image. The configured model may not support image generation.");
        }
        const sse = `event: image_generation.completed\ndata: ${JSON.stringify({ type: "image_generation.completed", b64_json: b64 })}\n\n`;
        return new Response(sse, { status: 200, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform" } });
      },
    },
  },
});
