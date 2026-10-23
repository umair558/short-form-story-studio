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
        const { generateImage, imageSettings, generateImageAgentRouter, agentRouterSettings } = await import("@/lib/image-gateway.server");
        const { width, height } = thumbnailSize(parsed.data.aspectRatio);
        const stream = raw["stream"] !== false;

        // Prefer the user's AgentRouter account when its key is configured.
        // Any failure (network, firewall page, unsupported model, no image)
        // falls back to the built-in image service below.
        const agentRouterKey = process.env["AGENTROUTER_API_KEY"];
        if (agentRouterKey) {
          try {
            const ar = await generateImageAgentRouter({ ...agentRouterSettings, apiKey: agentRouterKey }, thumbnailPrompt(parsed.data), `${width}x${height}`);
            const contentType = ar.headers.get("Content-Type") ?? "";
            if (ar.ok && contentType.includes("application/json")) {
              const json = (await ar.json()) as { data?: { b64_json?: string; url?: string }[] };
              const b64 = json.data?.[0]?.b64_json;
              if (b64) {
                const sse = `event: image_generation.completed\ndata: ${JSON.stringify({ type: "image_generation.completed", b64_json: b64 })}\n\n`;
                return new Response(sse, { status: 200, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform" } });
              }
              console.error("AgentRouter returned no image", JSON.stringify(json).slice(0, 300));
            } else {
              const detail = await ar.text().catch(() => "");
              console.error("AgentRouter image request failed", ar.status, detail.slice(0, 300));
            }
          } catch (error) {
            console.error("AgentRouter image request error", error);
          }
        }
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
