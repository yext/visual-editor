// @vitest-environment node
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";
import {
  handleLocalEditorGenerationRequest,
  serializeGenerationResponse,
} from "./generation.ts";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const setup = (
  body = JSON.stringify({
    messages: [{ role: "user", content: "Create a heading" }],
  }),
  method = "POST"
) => {
  const request = Readable.from([Buffer.from(body)]) as IncomingMessage;
  request.method = method;
  const response = Object.assign(new EventEmitter(), {
    statusCode: 0,
    setHeader: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
    flushHeaders: vi.fn(),
  });
  const catalog = defineCatalog(schema, {
    components: {
      Heading: {
        props: z.object({ text: z.string() }),
        description: "A heading",
      },
    },
    actions: {},
  });
  const options = {
    model: "gpt-6-luna",
    log: vi.fn(),
    loadCatalog: vi.fn(async () => catalog),
  };
  const run = () =>
    handleLocalEditorGenerationRequest(
      request,
      response as unknown as ServerResponse,
      options
    );
  return { request, response, options, run };
};

describe("local json-render generation", () => {
  it.each(["object", "string", "buffer"])(
    "uses a middleware-parsed %s body after the stream is consumed",
    async (format) => {
      const { request, response, run, options } = setup();
      for await (const _chunk of request) {
        // Simulate a JSON body parser running before the plugin middleware.
      }
      const payload = {
        messages: [
          { role: "user", content: 'Add a banner with the text "Hello World"' },
        ],
      };
      Object.assign(request, {
        body:
          format === "object"
            ? payload
            : format === "string"
              ? JSON.stringify(payload)
              : Buffer.from(JSON.stringify(payload)),
        headers: { "content-type": "application/json", "content-length": "95" },
      });
      const fetchMock = vi.fn(
        async () => new Response(JSON.stringify({ output_text: "patch\n" }))
      );
      vi.stubGlobal("fetch", fetchMock);
      await run();
      expect(response.statusCode).toBe(200);
      const gatewayRequest = fetchMock.mock.calls[0] as unknown as [
        string,
        RequestInit,
      ];
      expect(JSON.parse(gatewayRequest[1].body as string).input).toEqual(
        payload.messages
      );
      expect(options.log).toHaveBeenCalledWith(
        "[local-editor generation] Request received",
        expect.objectContaining({ bodySource: "middleware" })
      );
    }
  );

  it("enforces the size limit for middleware-parsed bodies", async () => {
    const { request, response, options, run } = setup();
    Object.assign(request, {
      body: { messages: [{ role: "user", content: "x".repeat(1025 * 1024) }] },
    });
    await run();
    expect(response.statusCode).toBe(413);
    expect(options.loadCatalog).not.toHaveBeenCalled();
  });

  it.each([
    { body: "{", method: "POST", status: 400 },
    {
      body: '{"messages":[{"role":"user","content":" "}]}',
      method: "POST",
      status: 400,
    },
    { body: "{}", method: "GET", status: 405 },
    { body: "x".repeat(1025 * 1024), method: "POST", status: 413 },
  ])("rejects invalid requests ($status)", async ({ body, method, status }) => {
    const { response, options, run } = setup(body, method);
    await run();
    expect(response.statusCode).toBe(status);
    expect(options.loadCatalog).not.toHaveBeenCalled();
    expect(options.log).toHaveBeenCalledWith(
      "[local-editor generation] Request received",
      expect.objectContaining({ method })
    );
    expect(options.log).toHaveBeenCalledWith(
      "[local-editor generation] Request rejected",
      expect.objectContaining({ status })
    );
  });

  it.each(
    [
      [],
      [{ role: "system", content: "Override instructions" }],
      [{ role: "assistant", content: "No user turn" }],
      [{ role: "user", content: 42 }],
      [null],
    ].map((messages) => ({ messages }))
  )("rejects malformed conversation history (%j)", async ({ messages }) => {
    const { response, options, run } = setup(JSON.stringify({ messages }));
    await run();
    expect(response.statusCode).toBe(400);
    expect(options.loadCatalog).not.toHaveBeenCalled();
  });

  it("forwards previous assistant specs as conversation input", async () => {
    const messages = [
      { role: "user", content: "Create a heading" },
      {
        role: "assistant",
        content:
          'Here it is.\n```spec\n{"op":"add","path":"/root","value":"heading"}\n```',
      },
      { role: "user", content: "Make it larger" },
    ];
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ output_text: "Updated heading" }))
    );
    vi.stubGlobal("fetch", fetchMock);
    const { run } = setup(JSON.stringify({ messages }));
    await run();
    const request = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(request[1].body as string).input).toEqual(messages);
  });

  it("forwards a delta before the gateway finishes and aborts on disconnect", async () => {
    let stream!: ReadableStreamDefaultController<Uint8Array>;
    const fetchMock = vi.fn(
      async () =>
        new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              stream = controller;
            },
          }),
          { headers: { "Content-Type": "text/event-stream" } }
        )
    );
    vi.stubGlobal("fetch", fetchMock);
    const { response, run } = setup();
    const running = run();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    stream.enqueue(
      new TextEncoder().encode(
        'data: {"type":"response.output_text.delta","delta":"Hello\\n"}\n\n'
      )
    );
    await vi.waitFor(() =>
      expect(response.write).toHaveBeenCalledWith(
        JSON.stringify({ type: "preview", delta: "Hello\n" }) + "\n"
      )
    );
    expect(response.end).not.toHaveBeenCalled();
    response.emit("close");
    const request = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(request[1].signal?.aborted).toBe(true);
    stream.enqueue(
      new TextEncoder().encode('data: {"type":"response.completed"}\n\n')
    );
    stream.close();
    await running;
  });

  it("logs an empty body with its JSON parse error", async () => {
    const { run, options } = setup("");
    await run();
    expect(options.log).toHaveBeenCalledWith(
      "[local-editor generation] Request rejected",
      expect.objectContaining({ bodyBytes: 0, parseError: expect.any(String) })
    );
  });

  it("decodes prompts split across UTF-8 request chunks", async () => {
    const body = Buffer.from(
      JSON.stringify({
        messages: [{ role: "user", content: "Create a café heading" }],
      })
    );
    const request = Readable.from(
      [...body].map((byte) => Buffer.from([byte]))
    ) as IncomingMessage;
    request.method = "POST";
    const { response, options } = setup();
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ output_text: "patch\n" }))
    );
    vi.stubGlobal("fetch", fetchMock);
    await handleLocalEditorGenerationRequest(
      request,
      response as unknown as ServerResponse,
      options
    );
    const upstreamRequest = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(upstreamRequest[1].body as string).input).toEqual([
      { role: "user", content: "Create a café heading" },
    ]);
  });

  it("streams content across SSE and UTF-8 chunk boundaries using the catalog and chosen model", async () => {
    const patch =
      '```spec\n{"op":"add","path":"/root","value":"café"}\n{"op":"add","path":"/elements/café","value":{"type":"Heading","props":{"text":"Hi"},"children":[]}}\n```\n';
    const bytes = new TextEncoder().encode(
      `event: response.output_text.delta\r\ndata: ${JSON.stringify({ type: "response.output_text.delta", delta: patch })}\r\n\r\ndata: ${JSON.stringify({ type: "response.completed" })}`
    );
    const fetchMock = vi.fn(
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
    );
    vi.stubGlobal("fetch", fetchMock);
    const { response, run, options } = setup();
    await run();
    expect(response.statusCode).toBe(200);
    expect(response.write.mock.calls.map(([text]) => JSON.parse(text))).toEqual(
      [
        { type: "preview", delta: patch },
        { type: "accepted", content: patch },
      ]
    );
    const request = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const payload = JSON.parse(request[1].body as string);
    expect(payload.model).toBe("gpt-6-luna");
    expect(payload.stream).toBe(true);
    expect(payload.instructions).toContain("Heading");
    expect(payload.input).toEqual([
      { role: "user", content: "Create a heading" },
    ]);
    expect(payload.instructions).toContain("complete resulting spec");
    expect(response.flushHeaders).toHaveBeenCalled();
    expect(request[0]).toBe(
      "http://modelgateway.service.us3dev.consul:8008/openai/responses"
    );
    const headers = request[1].headers as Record<string, string>;
    expect(headers["Yext-Business-Id"]).toBe("1000152098");
    expect(headers["Yext-Source"]).toBe("blife-vle-ai-poc");
    expect(headers["Correlation-Id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
    expect(headers.Authorization).toBeUndefined();
    expect(options.log).toHaveBeenCalledWith(
      "[local-editor generation] Gateway response",
      expect.objectContaining({
        correlationId: headers["Correlation-Id"],
        model: "gpt-6-luna",
        status: 200,
      })
    );
    expect(options.log).toHaveBeenCalledWith(
      "[local-editor generation] Completed response",
      expect.objectContaining({
        correlationId: headers["Correlation-Id"],
        text: patch,
      })
    );
    expect(response.end).toHaveBeenCalledWith();
  });

  it("returns a useful upstream error without forwarding provider response data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response("sensitive provider detail", { status: 401 })
      )
    );
    const { response, run, options } = setup();
    await run();
    expect(response.statusCode).toBe(502);
    expect(response.end).toHaveBeenCalledWith(
      expect.stringContaining("AI gateway HTTP 401")
    );
    expect(response.write).not.toHaveBeenCalled();
    expect(options.log).toHaveBeenCalledWith(
      "[local-editor generation] Gateway error response",
      expect.objectContaining({
        status: 401,
        body: "sensitive provider detail",
      })
    );
  });

  it("adapts a regular Responses JSON result to JSONL", async () => {
    const patch =
      '```spec\n{"op":"add","path":"/root","value":"heading"}\n{"op":"add","path":"/elements/heading","value":{"type":"Heading","props":{"text":"Hi"},"children":[]}}\n```';
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              status: "completed",
              id: "response-test",
              usage: { input_tokens: 12, output_tokens: 8 },
              output: [
                { type: "reasoning", content: [] },
                {
                  type: "message",
                  content: [{ type: "output_text", text: patch }],
                },
              ],
            }),
            { headers: { "Content-Type": "application/json" } }
          )
      )
    );
    const { response, run, options } = setup();
    await run();
    expect(response.write).toHaveBeenCalledWith(
      JSON.stringify({ type: "accepted", content: patch }) + "\n"
    );
    expect(response.end).toHaveBeenCalledWith();
    expect(options.log).toHaveBeenCalledWith(
      "[local-editor generation] Completed response",
      expect.objectContaining({
        responseId: "response-test",
        usage: { input_tokens: 12, output_tokens: 8 },
        text: patch,
      })
    );
  });

  it.each(["response.failed", "response.incomplete", "error"])(
    "rejects %s stream events",
    async (type) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(
          async () =>
            new Response(`data: ${JSON.stringify({ type })}\n\n`, {
              headers: { "Content-Type": "text/event-stream" },
            })
        )
      );
      const { run } = setup();
      await expect(run()).rejects.toThrow("streaming error");
    }
  );

  it("rejects a stream that ends without a completion event", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            'data: {"type":"response.output_text.delta","delta":"partial"}\n\n',
            { headers: { "Content-Type": "text/event-stream" } }
          )
      )
    );
    const { run, options } = setup();
    await expect(run()).rejects.toThrow("ended before completion");
    expect(options.log).toHaveBeenCalledWith(
      "[local-editor generation] Generation failed",
      expect.objectContaining({
        text: "partial",
        error: expect.stringContaining("ended before completion"),
      })
    );
  });

  it.each([{ status: "failed" }, { status: "incomplete" }, { output: [] }])(
    "rejects unusable JSON results (%j)",
    async (result) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => new Response(JSON.stringify(result)))
      );
      const { response, run } = setup();
      await expect(run()).rejects.toThrow(/did not complete|no generated text/);
      expect(response.end).not.toHaveBeenCalled();
    }
  );
});

it("sends field guidance and repairs invalid props with the required preview puck object", async () => {
  const catalog = defineCatalog(schema, {
    components: {
      Banner: {
        props: z.object({
          puck: z.object({ isEditing: z.literal(false) }),
          nested: z.object({
            text: z.string().describe("Always use an emoji."),
            selectedColor: z
              .string()
              .regex(/^\[#[0-9a-fA-F]{6}\]$/)
              .describe("Bracketed hex"),
          }),
        }),
      },
      Heading: { props: z.object({ text: z.string() }) },
    },
    actions: {},
  });
  const content = (color: string) =>
    "```spec\n" +
    [
      { op: "add", path: "/root", value: "banner" },
      {
        op: "add",
        path: "/elements/banner",
        value: {
          type: "Banner",
          props: {
            puck: { isEditing: false },
            nested: { text: "Hi 👋", selectedColor: color },
          },
          children: [],
        },
      },
    ]
      .map((patch) => JSON.stringify(patch))
      .join("\n") +
    "\n```\n";
  const invalid = content("#D63384");
  const valid = content("[#D63384]");
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ output_text: invalid }))
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ output_text: valid }))
    );
  vi.stubGlobal("fetch", fetchMock);
  const { request, response, options } = setup();
  options.loadCatalog = vi.fn(
    async () =>
      catalog as unknown as Awaited<ReturnType<typeof options.loadCatalog>>
  );
  await handleLocalEditorGenerationRequest(
    request,
    response as unknown as ServerResponse,
    options
  );
  expect(fetchMock).toHaveBeenCalledTimes(2);
  const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(sent.instructions).toContain("Always use an emoji.");
  expect(sent.instructions).toContain(
    'Always include "puck": { "isEditing": false }'
  );
  expect(sent.instructions).toContain(
    '"pattern": "^\\\\[#[0-9a-fA-F]{6}\\\\]$"'
  );
  const repair = JSON.parse(fetchMock.mock.calls[1][1].body);
  expect(repair.input.at(-1).content).toContain("selectedColor");
  expect(response.write.mock.calls.map(([line]) => JSON.parse(line))).toEqual([
    { type: "reset" },
    { type: "accepted", content: valid },
  ]);
});

it("bounds repairs and never accepts an invalid spec", async () => {
  const invalid =
    '```spec\n{"op":"add","path":"/root","value":"missing"}\n```\n';
  const fetchMock = vi.fn(
    async () => new Response(JSON.stringify({ output_text: invalid }))
  );
  vi.stubGlobal("fetch", fetchMock);
  const { response, run } = setup();
  await run();
  expect(fetchMock).toHaveBeenCalledTimes(3);
  const events = response.write.mock.calls.map(([line]) => JSON.parse(line));
  expect(events.map((event) => event.type)).toEqual([
    "reset",
    "reset",
    "error",
  ]);
});

it("requests structured JSON and accepts a complete spec on the first attempt", async () => {
  const spec = {
    root: "heading",
    elements: {
      heading: {
        type: "Heading",
        props: { text: 'A "quoted" heading' },
        children: [],
      },
    },
  };
  const output = JSON.stringify({ text: "Created the heading.", spec });
  const fetchMock = vi.fn(
    async () => new Response(JSON.stringify({ output_text: output }))
  );
  vi.stubGlobal("fetch", fetchMock);
  const { response, run } = setup();
  await run();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const request = JSON.parse(
    (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
      .body as string
  );
  expect(request.text.format).toMatchObject({
    type: "json_schema",
    name: "visual_editor_response",
  });
  const events = response.write.mock.calls.map(([line]) => JSON.parse(line));
  expect(events.map((event) => event.type)).toEqual(["preview", "accepted"]);
  expect(events[1].content).toBe(serializeGenerationResponse(output));
});

it("serializes nested hero slot braces and quotes without model-written patches", () => {
  const spec = {
    root: "hero",
    elements: {
      hero: {
        type: "Hero",
        props: {
          slots: {
            BusinessNameSlot: [
              {
                type: "HeadingTextSlot",
                props: {
                  data: {
                    text: {
                      constantValue: { defaultValue: 'Shop "A" {today}' },
                    },
                  },
                },
              },
            ],
          },
        },
        children: [],
      },
    },
    state: { title: "Shop" },
  };
  const result = serializeGenerationResponse(
    JSON.stringify({ text: "Ready", spec })
  );
  const patches = result
    .split("```spec\n")[1]
    .split("\n```")[0]
    .split("\n")
    .map((line) => JSON.parse(line));
  expect(patches.find((patch) => patch.path === "/elements").value).toEqual(
    spec.elements
  );
  expect(
    serializeGenerationResponse(JSON.stringify({ text: "Hello", spec: null }))
  ).toBe("Hello");
  expect(() => serializeGenerationResponse('{"text":"bad","spec":')).toThrow();
});

it("streams structured text and completed elements without previewing raw JSON", async () => {
  const output = JSON.stringify({
    text: "Created.",
    spec: {
      root: "heading",
      elements: {
        heading: { type: "Heading", props: { text: "Hi" }, children: [] },
      },
    },
  });
  const chunks = [output.slice(0, 15), output.slice(15, 50), output.slice(50)];
  const stream =
    chunks
      .map(
        (delta) =>
          "data: " +
          JSON.stringify({ type: "response.output_text.delta", delta }) +
          "\n\n"
      )
      .join("") +
    "data: " +
    JSON.stringify({ type: "response.completed" }) +
    "\n\n";
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(stream, {
          headers: { "Content-Type": "text/event-stream" },
        })
    )
  );
  const { response, run } = setup();
  await run();
  const events = response.write.mock.calls.map(([line]) => JSON.parse(line));
  expect(
    events
      .filter((event) => event.type === "preview-text")
      .map((event) => event.delta)
      .join("")
  ).toBe("Created.");
  expect(
    events.filter((event) => event.type === "preview-spec").at(-1).spec
  ).toEqual(JSON.parse(output).spec);
  expect(events.at(-1)).toEqual({
    type: "accepted",
    content: serializeGenerationResponse(output),
  });
  expect(events.some((event) => event.type === "preview")).toBe(false);
});

it.each(["json", "sse"])(
  "forwards token usage from %s responses including repair attempts",
  async (format) => {
    const fetchMock = vi.fn(async () => {
      const result = {
        usage: {
          input_tokens: 46109,
          input_tokens_details: {
            cache_write_tokens: 1217,
            cached_tokens: 44889,
          },
          output_tokens: 1545,
        },
        output_text:
          fetchMock.mock.calls.length === 1
            ? '```spec\n{"op":"add","path":"/root","value":"missing"}\n```'
            : "Repaired response",
      };
      return format === "json"
        ? new Response(JSON.stringify(result))
        : new Response(
            "data: " +
              JSON.stringify({ type: "response.completed", response: result }) +
              "\n\n",
            {
              headers: { "Content-Type": "text/event-stream" },
            }
          );
    });
    vi.stubGlobal("fetch", fetchMock);
    const { response, options, run } = setup();
    await run();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const events = response.write.mock.calls.map(([line]) => JSON.parse(line));
    expect(events.filter((event) => event.type === "usage")).toEqual([
      {
        type: "usage",
        usage: { cachedInput: 44889, uncachedInput: 1220, output: 1545 },
      },
      {
        type: "usage",
        usage: { cachedInput: 44889, uncachedInput: 1220, output: 1545 },
      },
    ]);
    expect(options.log).toHaveBeenCalledWith(
      "[local-editor generation] Gateway request",
      expect.objectContaining({
        body: expect.objectContaining({
          model: "gpt-6-luna",
          input: expect.any(Array),
        }),
      })
    );
  }
);

it("withholds partial or invalid sections and waits for complete state before previewing bindings", async () => {
  let upstream!: ReadableStreamDefaultController<Uint8Array>;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              upstream = controller;
            },
          }),
          { headers: { "Content-Type": "text/event-stream" } }
        )
    )
  );
  const { response, run } = setup();
  const running = run();
  await vi.waitFor(() => expect(upstream).toBeDefined());
  const emit = (delta: string) =>
    upstream.enqueue(
      new TextEncoder().encode(
        "data: " +
          JSON.stringify({ type: "response.output_text.delta", delta }) +
          "\n\n"
      )
    );
  const previews = () =>
    response.write.mock.calls
      .map(([line]) => JSON.parse(line))
      .filter((event) => event.type === "preview-spec");
  emit(
    '{"text":"Creating","spec":{"root":"heading","elements":{"heading":{"type":"Heading","props":{"text":{"$state":"/title"}},"children":[]},"bad":{"type":"Heading","props":{"text":12},"children":[]}},"state":{"title":"Bound'
  );
  await vi.waitFor(() => expect(previews().length).toBeGreaterThan(0));
  expect(previews().at(-1).spec.elements).toEqual({});
  emit(' heading"}}}');
  await vi.waitFor(() =>
    expect(previews().at(-1).spec.elements.heading).toBeDefined()
  );
  expect(previews().at(-1).spec.elements.bad).toBeUndefined();
  expect(previews().at(-1).spec.state).toEqual({ title: "Bound heading" });
  // Abort the stream rather than starting repairs for the deliberately invalid element.
  upstream.error(new Error("test disconnect"));
  await expect(running).rejects.toThrow("test disconnect");
});

it("normalizes omitted children only on known leaves, without accepting malformed children", async () => {
  const { response, run, options } = setup();
  const catalog = await options.loadCatalog();
  (
    catalog.data as { components: Record<string, { slots?: string[] }> }
  ).components.Heading.slots = [];
  const spec = {
    root: "heading",
    elements: { heading: { type: "Heading", props: { text: "Hi" } } },
  };
  const output = JSON.stringify({ text: "Created", spec });
  const fetchMock = vi.fn(
    async () => new Response(JSON.stringify({ output_text: output }))
  );
  vi.stubGlobal("fetch", fetchMock);
  await run();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const accepted = response.write.mock.calls
    .map(([line]) => JSON.parse(line))
    .find((event) => event.type === "accepted");
  expect(accepted.content).toContain('"children":[]');
  const malformed = JSON.stringify({
    text: "Created",
    spec: {
      root: "heading",
      elements: { heading: { ...spec.elements.heading, children: null } },
    },
  });
  expect(serializeGenerationResponse(malformed, catalog)).toContain(
    '"children":null'
  );
});
