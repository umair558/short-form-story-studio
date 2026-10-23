export type ImageConfig = { baseURL: string; apiKey: string; model: string };

export const imageSettings: Omit<ImageConfig, "apiKey"> = {
  baseURL: "https://ai.gateway.lovable.dev",
  model: "openai/gpt-image-2.5-sunburst",
};

export function generateImage(config: ImageConfig, prompt: string, size: string, stream = true) {
  return fetch(`${config.baseURL}/v1/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      prompt,
      size,
      quality: "high",
      output_format: "png",
      ...(stream ? { stream: true, partial_images: 1 } : {}),
    }),
  });
}

export const agentRouterSettings: Omit<ImageConfig, "apiKey"> = {
  baseURL: "https://agentrouter.org",
  model: "gpt-5.6-sol",
};

/** Non-streaming OpenAI-compatible image call against AgentRouter. */
export function generateImageAgentRouter(config: ImageConfig, prompt: string, size: string) {
  return fetch(`${config.baseURL}/v1/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      prompt,
      size,
      n: 1,
      response_format: "b64_json",
    }),
  });
}
