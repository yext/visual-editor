// @vitest-environment node
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import { handleLocalEditorGenerationRequest } from "./generation.ts";

const catalog = createPuckGenerationCatalog({
  Heading: { props: z.object({ text: z.string() }) },
});
const spec = {
  content: [{ type: "Heading", props: { id: "heading", text: "Café" } }],
};
const generated = JSON.stringify({ text: "Created", spec });
const prose = JSON.stringify({ text: "Answer", spec: null });
const conversation = {
  layoutId: "location",
  messages: [{ role: "user", content: "Create a heading" }],
};
const setup = (body = JSON.stringify(conversation), method = "POST") => {
  const request = Readable.from([Buffer.from(body)]) as IncomingMessage;
  request.method = method;
  const response = Object.assign(new EventEmitter(), {
    statusCode: 0,
    setHeader: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
    flushHeaders: vi.fn(),
  });
  const options = {
    model: "gpt-6-luna",
    log: vi.fn(),
    loadContext: vi.fn(async (layoutId: string) =>
      layoutId === "location" ? { catalog, locales: [] } : undefined
    ),
  };
  const run = () =>
    handleLocalEditorGenerationRequest(
      request,
      response as unknown as ServerResponse,
      options
    );
  const events = () =>
    response.write.mock.calls.map(([line]) => JSON.parse(line));
  return { request, response, options, run, events };
};
const gatewayJson = (output_text = generated, extra = {}) =>
  new Response(JSON.stringify({ output_text, ...extra }));
const sse = (event: object) => "data: " + JSON.stringify(event) + "\n\n";
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("native Puck generation", () => {
  it("aborts runaway repetition after a preview without repairing or accepting", async () => {
    let signal: AbortSignal;
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      signal = init.signal!;
      return new Response(
        sse({
          type: "response.output_text.delta",
          delta:
            '{"text":"Working","spec":{"content":[{"type":"Heading","props":{"id":"heading","text":"',
        }) +
          sse({
            type: "response.output_text.delta",
            delta: "Fast Food Restaurant abcdef0123456789 ".repeat(300),
          }),
        { headers: { "Content-Type": "text/event-stream" } }
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const target = setup();
    await target.run();
    expect(target.events().at(-1)).toMatchObject({
      type: "error",
      error: expect.stringContaining("repeated text excessively"),
    });
    expect(target.events().some((event) => event.type === "accepted")).toBe(
      false
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(signal!.aborted).toBe(true);
  });

  it("enforces the deadline while the gateway is actively streaming", async () => {
    vi.useFakeTimers();
    let heartbeat: ReturnType<typeof setInterval>;
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(
            encoder.encode(
              sse({
                type: "response.output_text.delta",
                delta: '{"text":"Working","spec":{"content":[',
              })
            )
          );
          heartbeat = setInterval(
            () => controller.enqueue(encoder.encode(": heartbeat\n\n")),
            1_000
          );
          init.signal!.addEventListener(
            "abort",
            () => {
              clearInterval(heartbeat);
              controller.error(init.signal!.reason);
            },
            { once: true }
          );
        },
      });
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const target = setup();
    const run = target.run();
    await vi.advanceTimersByTimeAsync(120_000);
    await run;
    expect(target.events().at(-1)).toMatchObject({
      type: "error",
      error: expect.stringContaining("two-minute deadline"),
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reports a deadline before the first stream event as HTTP 504", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal!.addEventListener(
              "abort",
              () => reject(init.signal!.reason),
              { once: true }
            );
          })
      )
    );
    const target = setup();
    const run = target.run();
    await vi.advanceTimersByTimeAsync(120_000);
    await run;
    expect(target.response.statusCode).toBe(504);
    expect(target.response.end.mock.calls[0][0]).toContain(
      "two-minute deadline"
    );
  });

  it("increases the request budget for large current layouts", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      gatewayJson()
    );
    vi.stubGlobal("fetch", fetchMock);
    const target = setup(
      JSON.stringify({
        ...conversation,
        currentData: {
          content: [
            {
              type: "Heading",
              props: {
                id: "heading",
                text: "Large current layout. ".repeat(2_000),
              },
            },
          ],
        },
      })
    );
    await target.run();
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body.max_output_tokens).toBeGreaterThan(16_384);
    expect(target.events().at(-1)?.type).toBe("accepted");
  });

  it.each(["json", "stream"])(
    "reports %s token-budget exhaustion without repair",
    async (format) => {
      const incomplete = {
        status: "incomplete",
        incomplete_details: { reason: "max_output_tokens" },
      };
      const fetchMock = vi.fn(async () =>
        format === "json"
          ? gatewayJson("", incomplete)
          : new Response(
              sse({ type: "response.incomplete", response: incomplete }),
              { headers: { "Content-Type": "text/event-stream" } }
            )
      );
      vi.stubGlobal("fetch", fetchMock);
      const target = setup();
      await expect(target.run()).rejects.toThrow("output token budget");
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(target.events().some((event) => event.type === "accepted")).toBe(
        false
      );
    }
  );

  it("requires strict output and does not duplicate property schemas in the prompt", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      gatewayJson()
    );
    vi.stubGlobal("fetch", fetchMock);
    await setup().run();
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body.text.format.strict).toBe(true);
    expect(body.max_output_tokens).toBe(16_384);
    expect(JSON.stringify(body.text.format.schema)).toContain(
      '"const":"Heading"'
    );
    expect(body.instructions).not.toContain('"properties"');
    expect(body.instructions).not.toContain('"fields"');
  });

  it("rejects incompatible schemas and current content before calling the gateway", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const incompatible = setup();
    incompatible.options.loadContext.mockResolvedValue({
      catalog: createPuckGenerationCatalog({
        Heading: { props: z.object({ text: z.unknown() }) },
      }),
      locales: [],
    });
    await incompatible.run();
    expect(incompatible.response.statusCode).toBe(422);
    expect(incompatible.response.end.mock.calls[0][0]).toContain(
      "Heading.props.text"
    );
    const unsupported = setup(
      JSON.stringify({
        ...conversation,
        currentData: {
          content: [{ type: "Missing", props: { id: "missing" } }],
        },
      })
    );
    await unsupported.run();
    expect(unsupported.response.statusCode).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("strips historical flags and normalizes optional props before restoring matching flags", async () => {
    const currentData = {
      content: [{ ...spec.content[0], readOnly: { text: true } }],
    };
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      gatewayJson(
        JSON.stringify({
          text: "Created",
          spec: {
            content: [
              {
                ...spec.content[0],
                props: { ...spec.content[0].props, optional: null },
              },
            ],
          },
        })
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    const target = setup(
      JSON.stringify({
        ...conversation,
        currentData,
        messages: [
          {
            role: "assistant",
            content: JSON.stringify({ text: "Earlier", spec: currentData }),
          },
          ...conversation.messages,
        ],
      })
    );
    target.options.loadContext.mockResolvedValue({
      catalog: createPuckGenerationCatalog({
        Heading: {
          props: z.object({
            text: z.string(),
            optional: z.string().optional(),
          }),
        },
      }),
      locales: [],
    });
    await target.run();
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(JSON.stringify(body.input)).not.toContain("readOnly");
    expect(target.events().at(-1)).toEqual({
      type: "accepted",
      text: "Created",
      spec: currentData,
    });
  });

  it.each(["json", "stream"])(
    "does not repair or accept a %s refusal",
    async (format) => {
      const refused = {
        output: [{ type: "message", content: [{ type: "refusal" }] }],
      };
      const fetchMock = vi.fn(async () =>
        format === "json"
          ? gatewayJson(generated, refused)
          : new Response(sse({ type: "response.refusal.done" }), {
              headers: { "Content-Type": "text/event-stream" },
            })
      );
      vi.stubGlobal("fetch", fetchMock);
      const target = setup();
      await expect(target.run()).rejects.toThrow("refused");
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(target.events().some((event) => event.type === "accepted")).toBe(
        false
      );
    }
  );

  it("reports a refusal after a preview as an actionable stream error", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          sse({
            type: "response.output_text.delta",
            delta: '{"text":"Preparing',
          }) + sse({ type: "response.refusal.done" }),
          { headers: { "Content-Type": "text/event-stream" } }
        )
    );
    vi.stubGlobal("fetch", fetchMock);
    const target = setup();
    await target.run();
    expect(target.events().at(-1)).toEqual({
      type: "error",
      error: "The AI gateway refused generation.",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(target.events().some((event) => event.type === "accepted")).toBe(
      false
    );
  });

  it("places the current editor layout after historical context and before the new prompt", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      gatewayJson()
    );
    vi.stubGlobal("fetch", fetchMock);
    const { run } = setup(
      JSON.stringify({
        ...conversation,
        currentData: spec,
        messages: [
          { role: "user", content: "Create" },
          { role: "assistant", content: generated },
          { role: "user", content: "Revise my manual edits" },
        ],
      })
    );
    await run();
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body.input).toHaveLength(4);
    expect(body.input[2].content).toContain("authoritative starting point");
    const current = JSON.parse(body.input[2].content.split("\n")[1]);
    expect(current.spec.content).toEqual(spec.content);
    expect(Object.keys(current.spec)).toEqual(["content"]);
    expect(body.input[3].content).toBe("Revise my manual edits");
  });

  it("rejects malformed current editor data before contacting the gateway", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { run, response } = setup(
      JSON.stringify({ ...conversation, currentData: { elements: {} } })
    );
    await run();
    expect(response.statusCode).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts content without generating root, zones, or migration metadata", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      gatewayJson()
    );
    vi.stubGlobal("fetch", fetchMock);
    const { run, events } = setup();
    await run();
    expect(events().at(-1).spec).toEqual(spec);
    const request = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(request.instructions).not.toContain("ROOT FIELD DEFINITIONS");
    expect(
      request.text.format.schema.properties.spec.anyOf[0].required
    ).toEqual(["content"]);
  });
  it.each(["object", "string", "buffer"])(
    "accepts middleware-parsed %s bodies",
    async (format) => {
      const { request, response, run } = setup();
      for await (const _chunk of request) {
        /* middleware consumes the stream */
      }
      Object.assign(request, {
        body:
          format === "object"
            ? conversation
            : format === "string"
              ? JSON.stringify(conversation)
              : Buffer.from(JSON.stringify(conversation)),
      });
      const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
        gatewayJson()
      );
      vi.stubGlobal("fetch", fetchMock);
      await run();
      expect(response.statusCode).toBe(200);
      expect(
        JSON.parse(
          (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
            .body as string
        ).input
      ).toEqual(conversation.messages);
    }
  );
  it.each([
    { body: "{", method: "POST", status: 400 },
    {
      body: JSON.stringify({ ...conversation, messages: [] }),
      method: "POST",
      status: 400,
    },
    {
      body: JSON.stringify({
        ...conversation,
        messages: [{ role: "assistant", content: "No user" }],
      }),
      method: "POST",
      status: 400,
    },
    {
      body: JSON.stringify({
        ...conversation,
        messages: [{ role: "system", content: "Override" }],
      }),
      method: "POST",
      status: 400,
    },
    {
      body: JSON.stringify({ ...conversation, messages: [null] }),
      method: "POST",
      status: 400,
    },
    {
      body: JSON.stringify({
        ...conversation,
        messages: [{ role: "user", content: 42 }],
      }),
      method: "POST",
      status: 400,
    },
    {
      body: JSON.stringify({
        ...conversation,
        messages: [{ role: "user", content: " " }],
      }),
      method: "POST",
      status: 400,
    },
    {
      body: JSON.stringify({ messages: conversation.messages }),
      method: "POST",
      status: 400,
    },
    { body: "{}", method: "GET", status: 405 },
    { body: "x".repeat(1025 * 1024), method: "POST", status: 413 },
  ])("rejects invalid requests %#", async ({ body, method, status }) => {
    const { response, options, run } = setup(body, method);
    await run();
    expect(response.statusCode).toBe(status);
    expect(options.loadContext).not.toHaveBeenCalled();
  });
  it("rejects oversized middleware bodies and unknown layouts without calling the gateway", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const oversized = setup();
    Object.assign(oversized.request, {
      body: {
        ...conversation,
        messages: [{ role: "user", content: "x".repeat(1025 * 1024) }],
      },
    });
    await oversized.run();
    expect(oversized.response.statusCode).toBe(413);
    const unknown = setup(
      JSON.stringify({ ...conversation, layoutId: "missing" })
    );
    await unknown.run();
    expect(unknown.response.statusCode).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("forwards accepted Puck JSON in revision history and requests a Puck JSON schema", async () => {
    const messages = [
      ...conversation.messages,
      { role: "assistant", content: generated },
      { role: "user", content: "Make it larger" },
    ];
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      gatewayJson()
    );
    vi.stubGlobal("fetch", fetchMock);
    const { run, response, options, events } = setup(
      JSON.stringify({ ...conversation, messages })
    );
    await run();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    const request = JSON.parse(init.body as string);
    expect(request.input).toEqual(messages);
    expect(request.model).toBe("gpt-6-luna");
    expect(request.stream).toBe(true);
    expect(
      request.text.format.schema.properties.spec.anyOf[0].required
    ).toEqual(["content"]);
    expect(request.instructions).toContain("native Puck");
    expect(request.instructions).not.toContain("/elements");
    expect(options.loadContext).toHaveBeenCalledWith("location");
    expect(url).toContain("/openai/responses");
    expect(init.headers).toMatchObject({
      "Yext-Business-Id": "1000152098",
      "Yext-Source": "blife-vle-ai-poc",
      "Correlation-Id": expect.stringMatching(/^[0-9a-f-]{36}$/),
    });
    expect(response.setHeader).toHaveBeenCalledWith(
      "X-Visual-Editor-Generation",
      "validated-puck-content-v1"
    );
    expect(events()).toEqual([{ type: "accepted", ...JSON.parse(generated) }]);
  });
  it("decodes request prompts split across UTF-8 bytes", async () => {
    const payload = {
      ...conversation,
      messages: [{ role: "user", content: "Café 👋" }],
    };
    const request = Readable.from(
      [...Buffer.from(JSON.stringify(payload))].map((byte) =>
        Buffer.from([byte])
      )
    ) as IncomingMessage;
    request.method = "POST";
    const { response, options } = setup();
    const fetchMock = vi.fn(async () => gatewayJson(prose));
    vi.stubGlobal("fetch", fetchMock);
    await handleLocalEditorGenerationRequest(
      request,
      response as unknown as ServerResponse,
      options
    );
    expect(
      JSON.parse(
        (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
          .body as string
      ).input
    ).toEqual(payload.messages);
  });
  it("streams decoded text and validated data across UTF-8 and SSE boundaries", async () => {
    const bytes = new TextEncoder().encode(
      sse({ type: "response.output_text.delta", delta: generated }) +
        sse({ type: "response.completed" }).trimEnd()
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            new ReadableStream({
              start(controller) {
                for (const byte of bytes)
                  controller.enqueue(new Uint8Array([byte]));
                controller.close();
              },
            }),
            { headers: { "Content-Type": "text/event-stream" } }
          )
      )
    );
    const { run, events } = setup();
    await run();
    expect(
      events()
        .filter((event) => event.type === "preview-text")
        .map((event) => event.delta)
        .join("")
    ).toBe("Created");
    expect(
      events()
        .filter((event) => event.type === "preview-spec")
        .at(-1).spec
    ).toEqual(spec);
    expect(events().at(-1)).toEqual({
      type: "accepted",
      text: "Created",
      spec,
    });
    expect(events().some((event) => event.type === "preview")).toBe(false);
  });
  it("emits text before completion and aborts upstream when the client disconnects", async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const fetchMock = vi.fn(
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              stream = controller;
            },
          }),
          { headers: { "Content-Type": "text/event-stream" } }
        )
    );
    vi.stubGlobal("fetch", fetchMock);
    const { run, response, events } = setup();
    const running = run();
    await vi.waitFor(() => expect(stream).toBeDefined());
    stream.enqueue(
      new TextEncoder().encode(
        sse({ type: "response.output_text.delta", delta: '{"text":"Hello' })
      )
    );
    await vi.waitFor(() =>
      expect(events()).toContainEqual({ type: "preview-text", delta: "Hello" })
    );
    response.emit("close");
    expect(
      (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].signal
        ?.aborted
    ).toBe(true);
    stream.error(new Error("disconnected"));
    await expect(running).rejects.toThrow("disconnected");
  });
  it("reads regular Responses message output, reports usage, and logs completion", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              id: "response-test",
              status: "completed",
              usage: { input_tokens: 12, output_tokens: 8 },
              output: [
                { type: "reasoning", content: [] },
                {
                  type: "message",
                  content: [{ type: "output_text", text: generated }],
                },
              ],
            })
          )
      )
    );
    const { run, options, events } = setup();
    await run();
    expect(events().at(-1)).toEqual({
      type: "accepted",
      ...JSON.parse(generated),
    });
    expect(options.log).toHaveBeenCalledWith(
      "[local-editor generation] Completed response",
      expect.objectContaining({ responseId: "response-test", text: generated })
    );
  });
  it("returns useful HTTP errors without exposing provider details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("sensitive detail", { status: 401 }))
    );
    const { run, response } = setup();
    await run();
    expect(response.statusCode).toBe(502);
    expect(response.end).toHaveBeenCalledWith(
      expect.stringContaining("AI gateway HTTP 401")
    );
    expect(response.end.mock.calls[0][0]).not.toContain("sensitive detail");
  });
  it.each(["response.failed", "response.incomplete", "error"])(
    "rejects %s events",
    async (type) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(
          async () =>
            new Response(sse({ type }), {
              headers: { "Content-Type": "text/event-stream" },
            })
        )
      );
      await expect(setup().run()).rejects.toThrow("streaming error");
    }
  );
  it("rejects streams without gateway completion", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            sse({ type: "response.output_text.delta", delta: generated }),
            { headers: { "Content-Type": "text/event-stream" } }
          )
      )
    );
    const target = setup();
    await target.run();
    expect(target.events().at(-1)).toEqual({
      type: "error",
      error: expect.stringContaining("ended before completion"),
    });
    expect(target.events().some((event) => event.type === "accepted")).toBe(
      false
    );
  });
  it.each([{ status: "failed" }, { status: "incomplete" }, { output: [] }])(
    "rejects unusable JSON results %#",
    async (result) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response(JSON.stringify(result)))
      );
      await expect(setup().run()).rejects.toThrow(
        /did not complete|no generated text/
      );
    }
  );
  it("repairs invalid field props and preserves descriptions and refinements", async () => {
    const custom = createPuckGenerationCatalog({
      Heading: {
        props: z.object({
          text: z.string().regex(/👋/).describe("Always use an emoji."),
        }),
      },
    });
    const valid = JSON.stringify({
      text: "Repaired",
      spec: {
        ...spec,
        content: [{ type: "Heading", props: { id: "heading", text: "Hi 👋" } }],
      },
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(gatewayJson())
      .mockResolvedValueOnce(gatewayJson(valid));
    vi.stubGlobal("fetch", fetchMock);
    const { run, options, events } = setup();
    options.loadContext.mockResolvedValue({ catalog: custom, locales: [] });
    await run();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      JSON.stringify(
        JSON.parse(fetchMock.mock.calls[0][1]!.body as string).text.format
          .schema
      )
    ).toContain("Always use an emoji.");
    expect(
      JSON.parse(fetchMock.mock.calls[1][1].body).input.at(-1).content
    ).toContain("text");
    expect(events()).toEqual([
      { type: "reset" },
      { type: "accepted", ...JSON.parse(valid) },
    ]);
  });
  it.each([
    "not JSON",
    JSON.stringify({
      text: "Invalid",
      spec: {
        ...spec,
        content: [{ type: "Missing", props: { id: "missing" } }],
      },
    }),
  ])("bounds repairs and never accepts invalid output %#", async (invalid) => {
    const fetchMock = vi.fn(async () => gatewayJson(invalid));
    vi.stubGlobal("fetch", fetchMock);
    const { run, events } = setup();
    await run();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(events().map((event) => event.type)).toEqual([
      "reset",
      "reset",
      "error",
    ]);
  });
  it.each(["json", "sse"])(
    "retains usage across repair attempts with %s",
    async (format) => {
      const usage = {
        input_tokens: 46109,
        input_tokens_details: {
          cached_tokens: 44889,
          cache_write_tokens: 1217,
        },
        output_tokens: 1545,
      };
      const fetchMock = vi.fn(async () => {
        const output_text =
          fetchMock.mock.calls.length === 1 ? "invalid" : prose;
        return format === "json"
          ? gatewayJson(output_text, { usage })
          : new Response(
              sse({
                type: "response.completed",
                response: { output_text, usage },
              }),
              { headers: { "Content-Type": "text/event-stream" } }
            );
      });
      vi.stubGlobal("fetch", fetchMock);
      const { run, events } = setup();
      await run();
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(events().filter((event) => event.type === "usage")).toEqual(
        Array(2).fill({
          type: "usage",
          usage: { cachedInput: 44889, uncachedInput: 1220, output: 1545 },
        })
      );
    }
  );
});
