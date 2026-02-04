/**
 * A simple Node server to forward requests from the local starter to the Puck API.
 */

import http from "node:http";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { puckHandler } from "@puckeditor/cloud-client";
import { puckAiSystemContext } from "@yext/visual-editor";

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

    const origin = createRequestOrigin(originHeader, req.headers.host);
    const route = match[1];

    const puckRequest = new Request(`${origin}/api/puck/${route}`, {
      method: "POST",
      body: rawBody,
    });

    const puckResponse = await puckHandler(puckRequest, {
      ai: { context: puckAiSystemContext },
      apiKey: process.env.PUCK_API_KEY,
    });

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

server.listen(PORT, HOST, () => {
  console.log(`ai-backend listening on http://${HOST}:${PORT}`);
});
