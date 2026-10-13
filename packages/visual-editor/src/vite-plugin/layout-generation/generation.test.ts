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
const generated = [
  JSON.stringify({
    op: "add",
    path: "/elements/heading",
    value: { type: "Heading", props: { text: "Café" } },
  }),
  JSON.stringify({
    op: "add",
    path: "/elements/__puck_content_root__/children/-",
    value: "heading",
  }),
].join("\n");
const accepted = { text: "Updated the layout.", spec };
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
  it.each([
    "missing_props",
    "misplaced_slots",
    "disconnected",
    "malformed_prefix",
  ])(
    "repairs the rejected %s draft while adding a separate promo and preserving the original",
    async (failure) => {
      const custom = createPuckGenerationCatalog({
        Promo: {
          props: z.object({
            title: z.string(),
            data: z.object({ backgroundImage: z.object({ url: z.string() }) }),
            slots: z.object({
              HeadingSlot: z.array(z.unknown()),
              VideoSlot: z.array(z.unknown()),
            }),
          }),
          fields: {
            slots: {
              type: "object",
              objectFields: {
                HeadingSlot: { type: "slot" },
                VideoSlot: { type: "slot" },
              },
            },
          },
        },
        Heading: { props: z.object({ text: z.string() }), nestedOnly: true },
      });
      const existing = {
        type: "Promo",
        props: {
          id: "existing",
          title: "Original",
          data: { backgroundImage: { url: "original" } },
          slots: { HeadingSlot: [], VideoSlot: [] },
        },
        readOnly: { title: true },
      };
      const currentData = { content: [existing] };
      const draft: any = {
        type: "Promo",
        props: { title: "Added", data: { backgroundImage: { url: "new" } } },
        slots: { "/slots/HeadingSlot": ["heading"], "/slots/VideoSlot": [] },
      };
      const repair: any[] = [];
      if (failure === "missing_props") {
        delete draft.props.data.backgroundImage;
        delete draft.slots["/slots/VideoSlot"];
        repair.push(
          {
            op: "add",
            path: "/elements/new/props/data/backgroundImage",
            value: { url: "new" },
          },
          {
            op: "add",
            path: "/elements/new/slots/~1slots~1VideoSlot",
            value: [],
          }
        );
      } else if (failure === "misplaced_slots") {
        draft.props["/slots/HeadingSlot"] = ["heading"];
        delete draft.slots;
        repair.push(
          { op: "remove", path: "/elements/new/props/~1slots~1HeadingSlot" },
          {
            op: "add",
            path: "/elements/new/slots",
            value: {
              "/slots/HeadingSlot": ["heading"],
              "/slots/VideoSlot": [],
            },
          }
        );
      }
      const prefix: any[] = [
        {
          op: "add",
          path: "/elements/heading",
          value: { type: "Heading", props: { text: "New heading" } },
        },
      ];
      if (failure !== "malformed_prefix")
        prefix.push({ op: "add", path: "/elements/new", value: draft });
      else repair.push({ op: "add", path: "/elements/new", value: draft });
      if (failure !== "disconnected" && failure !== "malformed_prefix")
        prefix.push({
          op: "add",
          path: "/elements/__puck_content_root__/children/-",
          value: "new",
        });
      else
        repair.push({
          op: "add",
          path: "/elements/__puck_content_root__/children/-",
          value: "new",
        });
      const first =
        prefix.map((op) => JSON.stringify(op)).join("\n") +
        (failure === "malformed_prefix"
          ? '\n{"op":"add","path":"/elements/new","value":{}\n'
          : "");
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(gatewayJson(first))
        .mockResolvedValueOnce(
          gatewayJson(repair.map((op) => JSON.stringify(op)).join("\n"))
        );
      vi.stubGlobal("fetch", fetchMock);
      const target = setup(
        JSON.stringify({
          ...conversation,
          currentData,
          messages: [{ role: "user", content: "Add an immersive promo" }],
        })
      );
      target.options.loadContext.mockResolvedValue({
        catalog: custom,
        locales: [],
      });
      await target.run();
      const prompt = JSON.parse(fetchMock.mock.calls[1][1].body).input.at(
        -1
      ).content;
      expect(prompt).toContain('"heading":');
      expect(prompt).toContain("rejected draft");
      const accepted = target.events().at(-1);
      expect(accepted).toMatchObject({ type: "accepted" });
      expect(accepted.spec.content[0]).toEqual(existing);
      expect(accepted.spec.content[1].props).toMatchObject({
        id: "new",
        title: "Added",
        slots: {
          HeadingSlot: [{ props: { id: "heading", text: "New heading" } }],
          VideoSlot: [],
        },
      });
      expect(
        target.events().filter((event) => event.type === "preview-spec")
      ).toHaveLength(1);
      expect(currentData.content).toEqual([existing]);
    }
  );

  it("repairs malformed streaming output into a new component with previously absent nested slot props", async () => {
    const custom = createPuckGenerationCatalog({
      Heading: { props: z.object({ text: z.string() }), nestedOnly: true },
      Promo: {
        props: z.object({
          slots: z.object({ HeadingSlot: z.array(z.unknown()) }),
        }),
        fields: {
          slots: {
            type: "object",
            objectFields: { HeadingSlot: { type: "slot", allow: ["Heading"] } },
          },
        },
      },
    });
    const valid = [
      {
        op: "add",
        path: "/elements/heading",
        value: { type: "Heading", props: { text: "Welcome" } },
      },
      {
        op: "add",
        path: "/elements/promo",
        value: {
          type: "Promo",
          props: {},
          slots: { "/slots/HeadingSlot": ["heading"] },
        },
      },
      {
        op: "add",
        path: "/elements/__puck_content_root__/children/-",
        value: "promo",
      },
    ]
      .map((operation) => JSON.stringify(operation))
      .join("\n");
    const cancelled = vi.fn();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(
                new TextEncoder().encode(
                  sse({
                    type: "response.output_text.delta",
                    delta: '{"op":"add","path":"/elements/promo","value":{}\n',
                  })
                )
              );
            },
            cancel: cancelled,
          }),
          { headers: { "Content-Type": "text/event-stream" } }
        )
      )
      .mockResolvedValueOnce(gatewayJson(valid));
    vi.stubGlobal("fetch", fetchMock);
    const target = setup();
    target.options.loadContext.mockResolvedValue({
      catalog: custom,
      locales: [],
    });
    await target.run();
    expect(cancelled).toHaveBeenCalled();
    expect(target.events().at(-1)).toMatchObject({
      type: "accepted",
      spec: {
        content: [
          {
            type: "Promo",
            props: {
              id: "promo",
              slots: {
                HeadingSlot: [
                  {
                    type: "Heading",
                    props: { id: "heading", text: "Welcome" },
                  },
                ],
              },
            },
          },
        ],
      },
    });
    expect(
      target.events().filter((event) => event.type === "preview-text")
    ).toEqual([]);
    const repairPrompt = JSON.parse(fetchMock.mock.calls[1][1].body).input.at(
      -1
    ).content;
    expect(repairPrompt).toContain("line 1, operation 1");
    expect(repairPrompt).toContain("actual newline");
    const outcomes = target.options.log.mock.calls
      .filter(([message]) => message.endsWith("Attempt outcome"))
      .map(([, details]) => details);
    expect(outcomes).toMatchObject([
      {
        attempt: 1,
        validationOutcome: "rejected",
        failureCategory: "malformed_json",
        repair: true,
        parsedOperationCount: 0,
        validPreviewCount: 0,
      },
      {
        attempt: 2,
        validationOutcome: "accepted",
        parsedOperationCount: 3,
        validPreviewCount: 1,
      },
    ]);
  });

  it("repairs a patch application failure from the last validated candidate and preserves editor flags", async () => {
    const currentData = {
      content: [
        {
          type: "Heading",
          props: { id: "heading", text: "Before" },
          readOnly: { text: true },
        },
      ],
    };
    const initialOutput =
      [
        { op: "replace", path: "/elements/heading/props/text", value: "Safe" },
        { op: "test", path: "/root", value: "wrong" },
      ]
        .map((operation) => JSON.stringify(operation))
        .join("\n") + "\n";
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(gatewayJson(initialOutput))
      .mockResolvedValueOnce(
        gatewayJson(
          '{"op":"replace","path":"/elements/heading/props/text","value":"After"}'
        )
      );
    vi.stubGlobal("fetch", fetchMock);
    const target = setup(JSON.stringify({ ...conversation, currentData }));
    await target.run();
    const repair = JSON.parse(fetchMock.mock.calls[1][1].body).input.at(
      -1
    ).content;
    expect(repair).toContain('"text": "Safe"');
    expect(repair).not.toContain('"text": "Before"');
    expect(target.events().at(-1)).toMatchObject({
      type: "accepted",
      spec: {
        content: [
          { props: { id: "heading", text: "After" }, readOnly: { text: true } },
        ],
      },
    });
    const firstOutcome = target.options.log.mock.calls.find(([message]) =>
      message.endsWith("Attempt outcome")
    )![1];
    expect(firstOutcome).toMatchObject({
      failureCategory: "patch_application",
      parsedOperationCount: 2,
      patchCount: 1,
      validPreviewCount: 1,
    });
    expect(currentData.content[0].props.text).toBe("Before");
  });

  it("applies a flat JSON Patch property edit and accepts reconstructed Puck content", async () => {
    const currentData = {
      content: [
        {
          type: "MainContent",
          props: {
            id: "main",
            content: [
              { type: "Heading", props: { id: "heading", text: "Before" } },
            ],
          },
        },
      ],
    };
    const patch = JSON.stringify({
      op: "replace",
      path: "/elements/heading/props/text",
      value: "After",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => gatewayJson(patch))
    );
    const target = setup(JSON.stringify({ ...conversation, currentData }));
    await target.run();
    expect(target.events().at(-1)).toEqual({
      type: "accepted",
      text: "Updated the layout.",
      spec: {
        content: [
          {
            type: "MainContent",
            props: {
              id: "main",
              content: [
                { type: "Heading", props: { id: "heading", text: "After" } },
              ],
            },
          },
        ],
      },
    });
  });

  it("creates an initial layout through the same flat patch stream", async () => {
    const output = [
      JSON.stringify({
        op: "add",
        path: "/elements/heading",
        value: { type: "Heading", props: { text: "New" } },
      }),
      JSON.stringify({
        op: "add",
        path: "/elements/__puck_content_root__/children/-",
        value: "heading",
      }),
    ].join("\n");
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      gatewayJson(output)
    );
    vi.stubGlobal("fetch", fetchMock);
    const target = setup();
    await target.run();
    expect(target.events().at(-1)).toEqual({
      type: "accepted",
      text: "Updated the layout.",
      spec: {
        content: [{ type: "Heading", props: { id: "heading", text: "New" } }],
      },
    });
    const request = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(request.text).toBeUndefined();
    expect(request.input.at(-1).content).toContain(
      "Output ONLY the JSON Patch lines"
    );
  });

  it("handles insertion, deletion, and reordering through the flat graph", async () => {
    const currentData = {
      content: [
        {
          type: "MainContent",
          props: {
            id: "main",
            content: [
              { type: "Heading", props: { id: "a", text: "A" } },
              { type: "Heading", props: { id: "b", text: "B" } },
              { type: "Heading", props: { id: "c", text: "C" } },
            ],
          },
        },
      ],
    };
    const patch = [
      { op: "remove", path: "/elements/b" },
      { op: "remove", path: "/elements/main/children/1" },
      {
        op: "add",
        path: "/elements/d",
        value: { type: "Heading", props: { text: "D" } },
      },
      { op: "add", path: "/elements/main/children/1", value: "d" },
      {
        op: "move",
        from: "/elements/main/children/1",
        path: "/elements/main/children/2",
      },
    ]
      .map((operation) => JSON.stringify(operation))
      .join("\n");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, _init?: RequestInit) => gatewayJson(patch))
    );
    const target = setup(JSON.stringify({ ...conversation, currentData }));
    await target.run();
    expect(target.events().at(-1)).toMatchObject({
      type: "accepted",
      spec: {
        content: [
          {
            type: "MainContent",
            props: {
              content: [
                { props: { id: "a", text: "A" } },
                { props: { id: "c", text: "C" } },
                { props: { id: "d", text: "D" } },
              ],
            },
          },
        ],
      },
    });
  });

  it("rejects malformed or prototype-sensitive patch paths", async () => {
    const patch = JSON.stringify({
      op: "add",
      path: "/elements/__proto__/props/x",
      value: "bad",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => gatewayJson(patch))
    );
    const target = setup();
    await target.run();
    expect(
      target.events().findLast((event) => event.type === "error")
    ).toMatchObject({
      type: "error",
      error: expect.stringContaining("Reserved prototype property"),
    });
    expect(target.events().some((event) => event.type === "accepted")).toBe(
      false
    );
  });

  it("rejects component props outside the formal Puck schema", async () => {
    const patch = [
      JSON.stringify({
        op: "add",
        path: "/elements/heading",
        value: { type: "Heading", props: { text: "ok", invented: true } },
      }),
      JSON.stringify({
        op: "add",
        path: "/elements/__puck_content_root__/children/-",
        value: "heading",
      }),
    ].join("\n");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(gatewayJson(patch))
      .mockImplementation(async () =>
        gatewayJson(
          '{"op":"test","path":"/root","value":"__puck_content_root__"}'
        )
      );
    vi.stubGlobal("fetch", fetchMock);
    const target = setup();
    await target.run();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(target.events().at(-1)).toMatchObject({
      type: "error",
      error: expect.stringContaining("invented"),
    });
    expect(target.events().some((event) => event.type === "accepted")).toBe(
      false
    );
  });

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
    expect(
      target.events().findLast((event) => event.type === "error")
    ).toMatchObject({
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
                delta: "Working ",
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
      gatewayJson(
        JSON.stringify({
          op: "replace",
          path: "/elements/heading/props/text",
          value: "Large",
        })
      )
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
      await target.run();
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(target.events().at(-1)).toMatchObject({
        type: "error",
        error: expect.stringContaining("output token budget"),
      });
      expect(target.events().some((event) => event.type === "accepted")).toBe(
        false
      );
    }
  );

  it("uses JSONL patches and does not duplicate property schemas in the prompt", async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      gatewayJson()
    );
    vi.stubGlobal("fetch", fetchMock);
    await setup().run();
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body.text).toBeUndefined();
    expect(body.max_output_tokens).toBe(16_384);
    expect(body.input.at(-1).content).toContain(
      "Output ONLY the JSON Patch lines"
    );
    expect(
      body.instructions.split(
        "Reconstructed native props schemas and declared slot paths:"
      )
    ).toHaveLength(2);
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
          op: "replace",
          path: "/elements/heading/props/text",
          value: "New",
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
      text: "Updated the layout.",
      spec: {
        content: [
          {
            ...spec.content[0],
            props: { id: "heading", text: "New" },
            readOnly: { text: true },
          },
        ],
      },
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
      await target.run();
      expect(target.events().at(-1)).toMatchObject({
        type: "error",
        error: expect.stringContaining("refused"),
      });
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
            delta: "Preparing",
          }) + sse({ type: "response.refusal.done" }),
          { headers: { "Content-Type": "text/event-stream" } }
        )
    );
    vi.stubGlobal("fetch", fetchMock);
    const target = setup();
    await target.run();
    expect(target.events().findLast((event) => event.type === "error")).toEqual(
      {
        type: "error",
        error: "The AI gateway refused generation.",
      }
    );
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
    expect(body.input).toHaveLength(2);
    expect(body.input[1].content).toContain("CURRENT UI STATE");
    expect(body.input[1].content).toContain('"heading"');
    expect(body.input[1].content).toContain(
      "USER REQUEST: Revise my manual edits"
    );
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
    expect(request.text).toBeUndefined();
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
      ).toHaveLength(1);
      expect(
        JSON.parse(
          (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
            .body as string
        ).input[0].content
      ).toContain("USER REQUEST: Create a heading");
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
  it("keeps layouts out of conversational history and requests flat JSONL patches", async () => {
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
    expect(request.input).toHaveLength(2);
    expect(request.input[0]).toEqual(messages[0]);
    expect(request.input[1].content).toContain("USER REQUEST: Make it larger");
    expect(request.model).toBe("gpt-6-luna");
    expect(request.stream).toBe(true);
    expect(request.text).toBeUndefined();
    expect(request.instructions).toContain("flat { root, elements }");
    expect(request.input[1].content).toContain('"elements"');
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
    expect(events().at(-1)).toEqual({ type: "accepted", ...accepted });
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
    ).toHaveLength(1);
    expect(
      JSON.parse(
        (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
          .body as string
      ).input[0].content
    ).toContain("Café 👋");
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
    ).toBe("");
    expect(
      events()
        .filter((event) => event.type === "preview-spec")
        .at(-1).spec
    ).toEqual(spec);
    expect(events().at(-1)).toEqual({
      type: "accepted",
      ...accepted,
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
        sse({ type: "response.output_text.delta", delta: "Hello" })
      )
    );
    await vi.waitFor(() =>
      expect(
        events()
          .filter((event) => event.type === "preview-text")
          .map((event) => event.delta)
          .join("")
      ).toBe("Hello")
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
      ...accepted,
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
      const target = setup();
      await target.run();
      expect(target.events().at(-1)).toMatchObject({
        type: "error",
        error: expect.stringContaining("streaming error"),
      });
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
    expect(target.events().findLast((event) => event.type === "error")).toEqual(
      {
        type: "error",
        error: expect.stringContaining("ended before completion"),
      }
    );
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
      const target = setup();
      await target.run();
      expect(target.events().at(-1)).toMatchObject({
        type: "error",
        error: expect.stringMatching(/did not complete|no generated text/),
      });
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
    const invalid = [
      JSON.stringify({
        op: "add",
        path: "/elements/heading",
        value: { type: "Heading", props: { text: "No emoji" } },
      }),
      JSON.stringify({
        op: "add",
        path: "/elements/__puck_content_root__/children/-",
        value: "heading",
      }),
    ].join("\n");
    const valid = JSON.stringify({
      op: "replace",
      path: "/elements/heading/props/text",
      value: "Hi 👋",
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(gatewayJson(invalid))
      .mockResolvedValueOnce(gatewayJson(valid));
    vi.stubGlobal("fetch", fetchMock);
    const { run, options, events } = setup();
    options.loadContext.mockResolvedValue({ catalog: custom, locales: [] });
    await run();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      JSON.stringify(
        JSON.parse(fetchMock.mock.calls[0][1]!.body as string).instructions
      )
    ).toContain("Always use an emoji.");
    expect(
      JSON.parse(fetchMock.mock.calls[1][1].body).input.at(-1).content
    ).toContain("text");
    expect(events().map((event) => event.type)).toEqual([
      "reset",
      "preview-spec",
      "accepted",
    ]);
    expect(events().at(-1)).toEqual({
      type: "accepted",
      text: "Updated the layout.",
      spec: {
        content: [{ type: "Heading", props: { id: "heading", text: "Hi 👋" } }],
      },
    });
  });
  it.each([
    JSON.stringify({ op: "bad", path: "/elements/x" }),
    [
      JSON.stringify({
        op: "add",
        path: "/elements/missing",
        value: { type: "Missing", props: {} },
      }),
      JSON.stringify({
        op: "add",
        path: "/elements/__puck_content_root__/children/-",
        value: "missing",
      }),
    ].join("\n"),
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
          fetchMock.mock.calls.length === 1
            ? JSON.stringify({ op: "bad", path: "/" })
            : prose;
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
