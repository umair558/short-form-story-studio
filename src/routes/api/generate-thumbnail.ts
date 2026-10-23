import { createFileRoute } from "@tanstack/react-router";
import { thumbnailInput, thumbnailPrompt, thumbnailSize } from "@/lib/ai-thumbnail";

function fail(status: number, error: string) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/generate-thumbnail")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        if (origin && origin !== new URL(request.url).origin)
          return fail(403, "Thumbnail generation must be requested from this website.");
        const body: unknown = await request.json().catch(() => null);
        const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
        const parsed = thumbnailInput.safeParse(raw);
        if (!parsed.success)
          return fail(400, parsed.error.issues[0]?.message ?? "Please check your options.");
        const { thumbnailIdentity, isImageBytes } = await import("@/lib/thumbnail-quota.server");
        const user = await thumbnailIdentity(request);
        if (!user)
          return fail(
            401,
            "Sign in to generate thumbnails. Five generations per UTC day are included.",
          );
        const apiKey = process.env["POLLINATIONS_API_KEY"];
        if (!apiKey) return fail(401, "Pollinations API key is not configured on this site yet.");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const reservation = await supabaseAdmin.rpc("reserve_thumbnail", { p_user: user.id });
        if (reservation.error || !reservation.data)
          return fail(
            429,
            reservation.error?.message ??
              "Could not reserve a generation. Please try again manually.",
          );
        const requestId = reservation.data;
        let generated = false;
        try {
          const {
            generateImagePollinations,
            pollinationsError,
            pollinationsConnectionError,
            POLLINATIONS_MODEL,
          } = await import("@/lib/image-gateway.server");
          const { width, height } = thumbnailSize(parsed.data.aspectRatio);
          let upstream: Response;
          try {
            upstream = await generateImagePollinations(
              apiKey,
              thumbnailPrompt(parsed.data),
              width,
              height,
            );
          } catch (error) {
            const failure = pollinationsConnectionError(error);
            // Log only a safe category, never the request URL, prompt, key or raw exception.
            console.error("Pollinations connection failure", {
              code: failure.code,
              status: failure.status,
              model: POLLINATIONS_MODEL,
            });
            return fail(failure.status, failure.message);
          }
          const contentType = upstream.headers.get("Content-Type") ?? "";
          if (upstream.status >= 300 && upstream.status < 400) {
            return fail(
              502,
              "Pollinations redirected the request instead of returning an image. No thumbnail was generated. Try Retry manually.",
            );
          }
          if (!upstream.ok) {
            const payload: unknown = /application\/(?:json|[\w.-]+\+json)/i.test(contentType)
              ? await upstream.json().catch(() => null)
              : null;
            return fail(upstream.status, pollinationsError(upstream.status, payload, apiKey));
          }
          if (!/image\/(png|jpeg|webp)/i.test(contentType) || !upstream.body) {
            return fail(
              502,
              "Pollinations returned no supported image. No thumbnail was generated.",
            );
          }
          const bytes = new Uint8Array(await upstream.arrayBuffer());
          if (!isImageBytes(bytes, contentType))
            return fail(502, "Pollinations returned an invalid image. Retry manually.");
          generated = true;
          const finalized = await supabaseAdmin.rpc("finish_thumbnail", {
            p_user: user.id,
            p_request: requestId,
            p_success: true,
          });
          if (finalized.error)
            return fail(
              503,
              "An image was generated but your allowance could not be confirmed. Please wait before retrying.",
            );
          return new Response(bytes, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "no-store",
              "X-Image-Provider": "Pollinations",
              "X-Image-Model": POLLINATIONS_MODEL,
              "X-Content-Type-Options": "nosniff",
              "X-Generations-Remaining": String(finalized.data),
            },
          });
        } catch {
          return fail(
            502,
            "The thumbnail connection was interrupted. A provider charge may still apply. Retry manually; no automatic retry was made.",
          );
        } finally {
          const finished = await supabaseAdmin.rpc("finish_thumbnail", {
            p_user: user.id,
            p_request: requestId,
            p_success: generated,
          });
          if (finished.error) console.error("Thumbnail allowance finalization failed");
        }
      },
    },
  },
});
