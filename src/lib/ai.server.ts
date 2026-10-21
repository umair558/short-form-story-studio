import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output, NoObjectGeneratedError, APICallError } from "ai";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export type AiResult<T> = { ok: true; data: T } | { ok: false; error: string; code: string };

function friendlyError(err: unknown): { error: string; code: string } {
  const status = APICallError.isInstance(err) ? err.statusCode : undefined;
  if (status === 401)
    return { code: "not_configured", error: "AI generation is temporarily unavailable (service not configured)." };
  if (status === 402)
    return { code: "credits", error: "AI generation is temporarily unavailable because the AI usage balance is exhausted. Please try again later." };
  if (status === 403)
    return { code: "forbidden", error: "AI generation is temporarily unavailable for this site. Please try again later." };
  if (status === 429)
    return { code: "rate_limited", error: "Too many requests right now. Please wait a minute and try again." };
  if (NoObjectGeneratedError.isInstance(err))
    return { code: "bad_output", error: "The AI returned an unexpected response. Please try again." };
  return { code: "unknown", error: "Something went wrong while generating. Please try again." };
}

export async function generateStructured<S extends z.ZodTypeAny>(
  schema: S,
  instructions: string,
  prompt: string,
): Promise<AiResult<z.infer<S>>> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return {
      ok: false,
      code: "not_configured",
      error: "AI generation is temporarily unavailable because the AI service is not configured.",
    };
  }
  try {
    const provider = createOpenAI({
      baseURL: GATEWAY,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const result = streamText({
      model: provider.responses(MODEL),
      instructions,
      prompt,
      output: Output.object({ schema }),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    let streamError: unknown;
    for await (const part of result.fullStream) {
      if (part.type === "error") streamError = part.error;
    }
    if (streamError) throw streamError;
    const data = (await result.output) as z.infer<S>;
    return { ok: true, data };
  } catch (err) {
    console.error("AI generation failed", err);
    return { ok: false, ...friendlyError(err) };
  }
}
