import { puckAiSystemContext } from "./systemPrompt.ts";

/**
 * Accepts the request from the editor and forwards it to Puck Cloud using the
 * same `/api/puck/chat` contract expected by the plugin.
 */
export const handlePuckAiRequest = async (
  request: Request
): Promise<Response> => {
  if (request.method !== "POST") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const apiKey = process.env.PUCK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Missing PUCK_API_KEY" }, { status: 500 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const chatParams = { ...body };
  const systemPrompt = chatParams.systemPrompt;
  delete chatParams.systemPrompt;
  const mode = chatParams.mode === "design" ? "design" : "assembly";
  const messages = Array.isArray(chatParams.messages)
    ? chatParams.messages.map((message) => {
        if (
          typeof message === "object" &&
          message &&
          "content" in message &&
          !("parts" in message) &&
          typeof message.content === "string"
        ) {
          return {
            ...message,
            parts: [{ type: "text", text: message.content }],
          };
        }

        return message;
      })
    : chatParams.messages;

  return fetch("https://cloud.puckeditor.com/api/chat", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "puck-api-version": request.headers.get("puck-api-version") ?? "v2",
      "x-puck-cloud-client-version": "0.8.2",
      ...(request.headers.get("x-puck-plugin-ai-version")
        ? {
            "x-puck-plugin-ai-version":
              request.headers.get("x-puck-plugin-ai-version") ?? "",
          }
        : {}),
    },
    body: JSON.stringify({
      ...chatParams,
      messages,
      tools: {},
      context:
        typeof systemPrompt === "string" ? systemPrompt : puckAiSystemContext,
      byok: {
        model:
          mode === "design" ? "openai/gpt-5.6-luna" : "openai/gpt-5.4-mini",
      },
    }),
  });
};
