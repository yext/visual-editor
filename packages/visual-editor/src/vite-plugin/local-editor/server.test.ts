// @vitest-environment node
import type { IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { readJsonRequestBody } from "./server.ts";

const payload = { text: "Café 😀" };
const json = JSON.stringify(payload);
const bytes = Buffer.byteLength(json);
const requestWithBody = (body: unknown) =>
  Object.assign(Readable.from([]), { body }) as IncomingMessage & {
    body: unknown;
  };

describe("bounded JSON request bodies", () => {
  it.each([payload, json, Buffer.from(json)])(
    "reads middleware bodies at the exact byte limit (%j)",
    async (body) => {
      expect(await readJsonRequestBody(requestWithBody(body), bytes)).toEqual({
        ok: true,
        payload,
        bodyBytes: bytes,
      });
    }
  );

  it("decodes Unicode split across byte-sized stream chunks", async () => {
    const chunks = [...Buffer.from(json)].map((byte) => Buffer.from([byte]));
    expect(
      await readJsonRequestBody(Readable.from(chunks) as IncomingMessage, bytes)
    ).toEqual({ ok: true, payload, bodyBytes: bytes });
  });

  it.each(["stream", "middleware"])(
    "enforces byte limits rather than character counts (%s)",
    async (source) => {
      const request =
        source === "stream"
          ? (Readable.from([json]) as IncomingMessage)
          : requestWithBody(json);
      expect(await readJsonRequestBody(request, json.length)).toEqual({
        ok: false,
        status: 413,
        bodyBytes: bytes,
      });
    }
  );

  it("stops consuming an oversized stream", async () => {
    async function* chunks() {
      yield Buffer.alloc(10);
      throw new Error("Oversized requests should not consume further chunks");
    }
    expect(
      await readJsonRequestBody(Readable.from(chunks()) as IncomingMessage, 9)
    ).toEqual({ ok: false, status: 413, bodyBytes: 10 });
  });

  it.each(["stream", "middleware"])(
    "reports invalid JSON (%s)",
    async (source) => {
      const request =
        source === "stream"
          ? (Readable.from(["{"]) as IncomingMessage)
          : requestWithBody("{");
      expect(await readJsonRequestBody(request, 10)).toMatchObject({
        ok: false,
        status: 400,
        bodyBytes: 1,
        parseError: expect.any(String),
      });
    }
  );
});
