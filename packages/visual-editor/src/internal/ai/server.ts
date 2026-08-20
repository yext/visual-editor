import packageJson from "../../../package.json" with { type: "json" };
import { yextAiFieldTypes } from "./fieldTypes.ts";
import { preparePuckAiConfig } from "./prepareRequest.ts";
import {
  puckAiDesignModeInstructions,
  puckAiSystemContext,
} from "./systemPrompt.ts";

const puckCloudClientVersion =
  packageJson.dependencies["@puckeditor/cloud-client"];

/**
 * Accepts the request from the editor and forwards it to Puck Cloud using the
 * same `/api/puck/chat` contract expected by the plugin.
 */
export const handlePuckAiRequest = async (
  request: Request
): Promise<Response> => {
  const apiKey = process.env.PUCK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Missing PUCK_API_KEY" }, { status: 500 });
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.pathname === "/api/puck/chat/tool") {
    return forwardPuckAiToolRequest(request, apiKey);
  }

  if (requestUrl.pathname !== "/api/puck/chat") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const chatParams: Record<string, unknown> = {
    ...body,
    config: preparePuckAiConfig(body.config as Record<string, any> | undefined),
  };
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
      "x-puck-cloud-client-version": puckCloudClientVersion,
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
      fieldTypes: yextAiFieldTypes,
      tools: {},
      designMode: {
        allowed: true,
        instructions: puckAiDesignModeInstructions,
      },
      context:
        typeof systemPrompt === "string" ? systemPrompt : puckAiSystemContext,
      byok: {
        model:
          mode === "design" ? "openai/gpt-5.6-luna" : "openai/gpt-5.4-mini",
      },
    }),
  });
};

const forwardPuckAiToolRequest = async (
  request: Request,
  apiKey: string
): Promise<Response> => {
  if (request.method !== "POST") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const response = await fetch("https://cloud.puckeditor.com/api/tool", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
};
