/**
 * A simple Node server to forward requests from the local starter to the Puck API.
 */

import http from "node:http";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { puckHandler } from "@puckeditor/cloud-client";
import { puckAiSystemContext, enabledAiComponents } from "@yext/visual-editor";

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "127.0.0.1";
const PUCK_ROUTE_REGEX = /^\/api\/puck\/(.+)$/;

const readBody = (req: http.IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: string[] = [];
    req.setEncoding("utf8");
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(chunks.join("")));
    req.on("error", reject);
  });

const setCorsHeaders = (res: http.ServerResponse, originHeader?: string) => {
  const corsOrigin = originHeader ?? "*";
  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");
  if (originHeader) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
};

const createRequestOrigin = (
  originHeader: string | undefined,
  hostHeader: string | undefined,
) => originHeader ?? `http://${hostHeader ?? "localhost"}`;

const getSseErrorText = (payload: string): string | null => {
  const lines = payload.split(/\r?\n/);
  for (const line of lines) {
    if (!line.startsWith("data:")) {
      continue;
    }
    const data = line.slice(5).trim();
    if (!data || data === "[DONE]") {
      continue;
    }
    try {
      const parsed = JSON.parse(data) as { type?: string; errorText?: string };
      if (parsed.type === "error" && parsed.errorText) {
        return parsed.errorText;
      }
    } catch {
      continue;
    }
  }
  return null;
};

const streamSseResponse = async (
  puckResponse: Response,
  res: http.ServerResponse,
) => {
  if (!puckResponse.body) {
    res.statusCode = puckResponse.status;
    res.end();
    return;
  }

  const reader = Readable.fromWeb(
    puckResponse.body as unknown as NodeReadableStream,
  );
  let buffer = "";

  const sendHeadersIfNeeded = () => {
    if (res.headersSent) {
      return;
    }
    res.statusCode = puckResponse.status;
    puckResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
  };

  try {
    for await (const chunk of reader) {
      const chunkText = chunk.toString("utf8");
      buffer += chunkText;

      const errorText = getSseErrorText(buffer);
      if (errorText) {
        if (!res.headersSent) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(errorText);
        } else {
          res.end();
        }
        reader.destroy();
        return;
      }

      sendHeadersIfNeeded();
      res.write(chunk);

      if (buffer.length > 64 * 1024) {
        buffer = buffer.slice(-4096);
      }
    }

    if (!res.headersSent) {
      sendHeadersIfNeeded();
    }
    res.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end("Internal server error");
    } else {
      res.end();
    }
  }
};

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.writeHead(400);
      res.end("Missing URL");
      return;
    }

    const originHeader = req.headers.origin as string | undefined;
    setCorsHeaders(res, originHeader);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);
    const match = url.pathname.match(PUCK_ROUTE_REGEX);

    if (!match) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    if (req.method !== "POST") {
      res.writeHead(405, { Allow: "POST" });
      res.end("Method not allowed");
      return;
    }

    const rawBody = await readBody(req);
    const body = JSON.parse(rawBody);

    const origin = createRequestOrigin(originHeader, req.headers.host);
    const route = match[1];

    const puckRequest = new Request(`${origin}/api/puck/${route}`, {
      method: "POST",
      body: JSON.stringify({
        ...body,
        config: {
          ...body.config,
          components: Object.fromEntries(
            Object.entries(body.config.components).filter(([component]) =>
              (enabledAiComponents as string[]).includes(component),
            ),
          ),
        },
      }),
    });

    const puckResponse = await puckHandler(puckRequest, {
      ai: { context: puckAiSystemContext },
      apiKey: process.env.PUCK_API_KEY,
    });

    const contentType = puckResponse.headers.get("content-type") ?? "";
    if (contentType.includes("text/event-stream")) {
      await streamSseResponse(puckResponse, res);
      return;
    }

    res.statusCode = puckResponse.status;
    puckResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (puckResponse.body) {
      Readable.fromWeb(puckResponse.body as unknown as NodeReadableStream).pipe(
        res,
      );
      return;
    }

    const buffer = Buffer.from(await puckResponse.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Internal server error");
  }
});

if (!process.env.PUCK_API_KEY) {
  console.error("PUCK_API_KEY environment variable is not set");
  process.exit(1);
}

server.listen(PORT, HOST, () => {
  console.log(`ai-backend listening on http://${HOST}:${PORT}`);
});
