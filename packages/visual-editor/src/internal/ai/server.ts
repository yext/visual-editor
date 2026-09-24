import { puckHandler, type PuckCloudOptions } from "@puckeditor/cloud-client";

/**
 * Routes Puck AI requests through the matching cloud client, preserving the
 * editor's context and design mode options while it prepares the cloud request.
 */
export const handlePuckAiRequest = async (
  request: Request
): Promise<Response> => {
  const apiKey =
    request.headers.get("x-puck-api-key") ?? process.env.PUCK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Missing PUCK_API_KEY" }, { status: 500 });
  }

  const endpoint = new URL(request.url).pathname.replace("/api/puck/", "");
  if (endpoint !== "chat" && endpoint !== "chat/tool") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body =
    endpoint === "chat"
      ? ((await request.clone().json()) as NonNullable<PuckCloudOptions["ai"]>)
      : undefined;

  return puckHandler(request, {
    apiKey,
    host: "https://puck-platform-git-chris-design-mode-comple-a8d2ce-puck-9db9778b.vercel.app/api",
    ai: body && {
      context: body.context,
      designMode: body.designMode,
      fieldTypes: body.fieldTypes,
    },
  });
};
