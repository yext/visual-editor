import type { MiddlewareHandler } from "hono";

const isLocalHost = (host: string) =>
  host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";

const isAllowedOrigin = (origin: string, isLocalServer: boolean) => {
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (host.endsWith(".preview.pagescdn.com")) {
      return true;
    }
    if (isLocalServer && isLocalHost(host)) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const corsForPuck: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header("Origin");
  const hostHeader = c.req.header("Host") ?? "";
  const requestHost = hostHeader.split(":")[0].toLowerCase();
  const isLocalServer = isLocalHost(requestHost);
  const allowed = origin ? isAllowedOrigin(origin, isLocalServer) : false;

  if (c.req.method === "OPTIONS") {
    if (allowed && origin) {
      c.header("Access-Control-Allow-Origin", origin);
      c.header("Vary", "Origin");
      c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
      const requestedHeaders = c.req.header("Access-Control-Request-Headers");
      if (requestedHeaders) {
        c.header("Access-Control-Allow-Headers", requestedHeaders);
      }
    }
    return c.body(null, 204);
  }

  await next();

  if (allowed && origin) {
    c.res.headers.set("Access-Control-Allow-Origin", origin);
    c.res.headers.set("Vary", "Origin");
    c.res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    const requestedHeaders = c.req.header("Access-Control-Request-Headers");
    if (requestedHeaders) {
      c.res.headers.set("Access-Control-Allow-Headers", requestedHeaders);
    }
  }
};
