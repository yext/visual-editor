import { puckHandler, chat } from "@puckeditor/cloud-client";
import type { Context } from "hono";
import { enabledAiComponents, puckAiSystemContext } from "./puckAiConfig";

type PuckChatRequestBody = Parameters<typeof chat>[0];

const parseBody = async (
  c: Context,
): Promise<PuckChatRequestBody | undefined> => {
  const contentType = c.req.header("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await c.req.json();
    } catch {
      return;
    }
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    try {
      const parsedBody = await c.req.parseBody();
      if (typeof parsedBody === "object" && "chatId" in parsedBody) {
        return parsedBody as unknown as PuckChatRequestBody;
      }
      return;
    } catch {
      return;
    }
  }
  return;
};

/** Accept the request from the editor, forward it to Puck, and stream the response. */
export const puckRouter = async (c: Context) => {
  try {
    const puckApiKey = c.env.PUCK_API_KEY;
    if (!puckApiKey) {
      return c.json({ success: false, error: "Missing PUCK_API_KEY" }, 500);
    }

    const origin = c.req.header("Origin");
    if (!origin) {
      return c.json({ success: false, error: "Missing Origin header" }, 400);
    }
    const pathname = `/api/puck/${c.req.param("route") ?? ""}`.replace(
      /\/+$/,
      "",
    );
    const url = new URL(pathname, origin);

    const body = await parseBody(c);

    if (!body) {
      return c.json({ success: false, error: "Invalid request body" }, 400);
    }

    const newComponents = Object.fromEntries(
      Object.entries(body.config.components ?? {}).filter(([component]) =>
        enabledAiComponents.includes(component),
      ),
    );

    const newBody = JSON.stringify({
      ...body,
      config: {
        ...body.config,
        components: newComponents,
      },
    });

    const puckRequest = new Request(url, {
      method: "POST",
      body: newBody,
      headers: { "content-type": "application/json" },
    });

    const puckResponse = await puckHandler(puckRequest, {
      ai: { context: puckAiSystemContext },
      apiKey: puckApiKey,
    });

    const isServerSideEvents = (
      puckResponse.headers.get("content-type") ?? ""
    ).includes("text/event-stream");
    if (!isServerSideEvents) {
      return puckResponse;
    }

    const headers = new Headers(puckResponse.headers);
    headers.set("Cache-Control", "no-cache");

    return new Response(puckResponse.body, {
      status: puckResponse.status,
      statusText: puckResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, error: "Failed to process request" }, 500);
  }
};
