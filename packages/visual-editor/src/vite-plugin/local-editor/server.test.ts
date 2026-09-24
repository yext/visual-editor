// @vitest-environment node

import type { IncomingMessage } from "node:http";
import { Readable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleLocalEditorRequest } from "./server.ts";

describe("handleLocalEditorRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards a chat body already parsed by Pages dev", async () => {
    const fetchMock = vi.fn(
      async (_url: string, _options?: RequestInit) => new Response("")
    );
    vi.stubGlobal("fetch", fetchMock);
    const request = Object.assign(Readable.from([]), {
      url: "/api/puck/chat",
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-puck-api-key": "test-api-key",
      },
      body: {
        chatId: "chat-123",
        messages: [],
        config: { components: {} },
        pageData: { root: { props: {} }, content: [], zones: {} },
        mode: "design",
      },
    }) as unknown as IncomingMessage;
    const response = {
      setHeader: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
      statusCode: 200,
    };

    await handleLocalEditorRequest(request, response, []);

    expect(
      JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)
    ).toMatchObject({
      chatId: "chat-123",
      mode: "design",
      byok: { model: "openai/gpt-5.6-luna" },
    });
  });
});
