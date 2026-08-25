import packageJson from "../../../package.json" with { type: "json" };

const puckCloudClientVersion =
  packageJson.dependencies["@puckeditor/cloud-client"];
const puckPluginAiVersion = packageJson.dependencies["@puckeditor/plugin-ai"];

/**
 * Proxies the complete Puck AI request prepared by the editor to the Puck canary.
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

  const headers = new Headers({
    "content-type": "application/json",
    "x-api-key": apiKey,
    "puck-api-version": "v2",
    "x-puck-cloud-client-version": puckCloudClientVersion,
    "x-puck-plugin-ai-version": puckPluginAiVersion,
  });

  return fetch(
    `https://puck-platform-ntuupuqgd-puck-9db9778b.vercel.app/api/${endpoint}`,
    {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.text(),
    }
  );
};
