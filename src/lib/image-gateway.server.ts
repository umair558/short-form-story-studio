export type ImageConfig = { baseURL: string; apiKey: string; model: string };

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
