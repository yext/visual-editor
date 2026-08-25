import { afterEach, describe, expect, it, vi } from "vitest";
import { handlePuckAiRequest } from "./server.ts";

describe("handlePuckAiRequest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards the original Puck chat request", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _options?: RequestInit) =>
        new Response("ok")
    );
    vi.stubGlobal("fetch", fetchMock);
    const body = JSON.stringify({
      chatId: "chat-123",
      mode: "design",
      messages: [
        { role: "user", parts: [{ type: "text", text: "Are you there?" }] },
      ],
      config: { components: {} },
      pageData: { root: { props: {}, type: "root" }, content: [], zones: {} },
    });

    await handlePuckAiRequest(
      new Request("http://localhost/api/puck/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-puck-api-key": "test-api-key",
          "x-puck-plugin-ai-version": "0.9.0-canary.d8bdabee",
        },
        body,
      })
    );

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://puck-platform-ntuupuqgd-puck-9db9778b.vercel.app/api/chat"
    );
    const options = fetchMock.mock.calls[0]?.[1];
    expect(options?.method).toBe("POST");
    expect(options?.body).toBe(body);
    expect(new Headers(options?.headers).get("content-type")).toBe(
      "application/json"
    );
    expect(new Headers(options?.headers).get("x-api-key")).toBe("test-api-key");
    expect(new Headers(options?.headers).get("puck-api-version")).toBe("v2");
    expect(new Headers(options?.headers).get("x-puck-plugin-ai-version")).toBe(
      "0.9.0-canary.d8bdabee"
    );
  });

  it("uses the local editor API key", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _options?: RequestInit) =>
        new Response("ok")
    );
    vi.stubGlobal("fetch", fetchMock);

    await handlePuckAiRequest(
      new Request("http://localhost/api/puck/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-puck-api-key": "local-editor-api-key",
        },
        body: "{}",
      })
    );

    expect(
      new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("x-api-key")
    ).toBe("local-editor-api-key");
  });

  it("forwards chat tool requests unchanged", async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _options?: RequestInit) =>
        new Response("ok")
    );
    vi.stubGlobal("fetch", fetchMock);
    const body = JSON.stringify({ id: "tool-123", output: { valid: true } });

    await handlePuckAiRequest(
      new Request("http://localhost/api/puck/chat/tool", {
        method: "POST",
        headers: { "x-puck-api-key": "test-api-key" },
        body,
      })
    );

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://puck-platform-ntuupuqgd-puck-9db9778b.vercel.app/api/chat/tool"
    );
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(body);
  });

  it("relays the Puck Cloud error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({ error: "testEntityField must provide a schema" }),
          {
            status: 422,
            headers: { "content-type": "application/json" },
          }
        );
      })
    );

    const response = await handlePuckAiRequest(
      new Request("http://localhost/api/puck/chat", {
        method: "POST",
        headers: { "x-puck-api-key": "test-api-key" },
        body: "{}",
      })
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: "testEntityField must provide a schema",
    });
  });
});
