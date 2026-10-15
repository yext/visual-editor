// @vitest-environment node
import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { compileGenerationSchema } from "./generationSchema.ts";
import { handleLocalEditorGenerationRequest } from "./generation.ts";
import { FRESH_PAGE_OUTPUT_TOKEN_BUDGET } from "./generationLimits.ts";
import { createPuckGenerationCatalog } from "./puckGenerationCatalog.ts";

const catalog = createPuckGenerationCatalog({
  Heading: {
    generation: { props: z.object({ text: z.string().min(1) }) },
    defaultProps: { text: "Default" },
  },
});
const baseline = {
  content: [
    {
      type: "Heading",
      props: { id: "heading", text: "Original", extra: "Keep" },
    },
  ],
};
const proposal = {
  text: "Created",
  result: {
    action: "create",
    content: [{ type: "Heading", props: { text: "New" } }],
  },
};
const completed = (value: any) =>
  new Response(
    JSON.stringify({
      status: "completed",
      output_text: JSON.stringify(value),
      usage: { input_tokens: 20, output_tokens: 10 },
    }),
    { headers: { "Content-Type": "application/json" } }
  );
const harness = (
  body: object = {
    layoutId: "location",
    currentData: { content: [] },
    messages: [{ role: "user", content: "Create page" }],
  },
  c = catalog
) => {
  const request = Object.assign(new EventEmitter(), {
    method: "POST",
    headers: {},
    body,
  });
  const response = Object.assign(new EventEmitter(), {
    statusCode: 0,
    destroyed: false,
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
  });
  return {
    response,
    run: () =>
      handleLocalEditorGenerationRequest(
        request as unknown as IncomingMessage,
        response as unknown as ServerResponse,
        {
          model: "test",
          loadContext: async () => ({ catalog: c, locales: ["en"] }),
          log: vi.fn(),
        }
      ),
    events: () => response.write.mock.calls.map(([line]) => JSON.parse(line)),
  };
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("strict request execution", () => {
  it("sends a gateway-enforced schema and accepts only a complete materialized candidate", async () => {
    const fetchMock = vi.fn(async () => completed(proposal));
    vi.stubGlobal("fetch", fetchMock);
    const h = harness();
    await h.run();
    expect(fetchMock).toHaveBeenCalledOnce();
    const body = JSON.parse((fetchMock.mock.calls[0] as any)[1].body);
    expect(body.text.format).toMatchObject({
      type: "json_schema",
      strict: true,
    });
    const localSchema = compileGenerationSchema(catalog, ["en"]).jsonSchema;
    expect(body.text.format.schema).toEqual(localSchema);
    expect(body.instructions).not.toContain("JSONL");
    expect(body.input.at(-1).content).not.toContain('"extra"');
    expect(h.events().find((e) => e.type === "accepted").spec).toEqual({
      content: [
        {
          type: "Heading",
          props: { id: expect.stringMatching(/^generated-/), text: "New" },
        },
      ],
    });
    expect(
      h.events().some((e) => ["preview-spec", "reset"].includes(e.type))
    ).toBe(false);
    const subsequent = harness({
      layoutId: "location",
      currentData: h.events().find((event) => event.type === "accepted").spec,
      messages: [{ role: "user", content: "Create another page" }],
    });
    await subsequent.run();
    expect(subsequent.response.statusCode).toBe(409);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it.each(["empty", "MainContent only"])(
    "uses the creation budget and accepts clarification for %s",
    async (startingPage) => {
      const currentData =
        startingPage === "empty"
          ? { content: [] }
          : {
              content: [
                {
                  type: "MainContent",
                  props: {
                    id: "main",
                    content: [],
                  },
                },
              ],
            };
      const fetchMock = vi.fn(async () =>
        completed({
          text: "Need details",
          result: { action: "clarification", question: "Which content?" },
        })
      );
      vi.stubGlobal("fetch", fetchMock);
      const h = harness({
        layoutId: "location",
        currentData,
        messages: [{ role: "user", content: "Generate a fresh page" }],
      });
      await h.run();
      expect(fetchMock).toHaveBeenCalledOnce();
      const requestBody = JSON.parse((fetchMock.mock.calls[0] as any)[1].body);
      expect(requestBody.max_output_tokens).toBe(
        FRESH_PAGE_OUTPUT_TOKEN_BUDGET
      );
      expect(h.events().at(-1)).toMatchObject({
        type: "accepted",
        text: "Need details\n\nWhich content?",
        spec: null,
      });
    }
  );
  it.each([
    "populated MainContent",
    "nonblank",
    "redesign",
    "new conversation",
  ])("rejects %s with 409 before the gateway", async (kind) => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const h = harness({
      layoutId: "location",
      currentData:
        kind === "populated MainContent"
          ? {
              content: [
                {
                  type: "MainContent",
                  props: { id: "main", content: baseline.content },
                },
              ],
            }
          : baseline,
      messages: [
        {
          role: "user",
          content:
            kind === "redesign" ? "Redesign the entire page" : "Create a page",
        },
      ],
    });
    await h.run();
    expect(h.response.statusCode).toBe(409);
    expect(h.response.end.mock.calls[0][0]).toContain("blank page");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(h.events()).toEqual([]);
  });
  it("rejects invalid output after one call without publishing a candidate", async () => {
    const fetchMock = vi.fn(async () =>
      completed({
        ...proposal,
        result: {
          action: "create",
          content: [{ type: "Heading", props: { text: "" } }],
        },
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    const h = harness();
    await h.run();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(h.events().at(-1).type).toBe("error");
    expect(h.events().some((e) => e.type === "accepted")).toBe(false);
  });
  it.each(["refusal", "exhaustion", "transport", "incomplete"])(
    "does not repair %s failures",
    async (kind) => {
      const result =
        kind === "refusal"
          ? { output: [{ type: "message", content: [{ type: "refusal" }] }] }
          : kind === "exhaustion"
            ? {
                status: "incomplete",
                incomplete_details: { reason: "max_output_tokens" },
              }
            : { status: "incomplete" };
      const fetchMock = vi.fn(async () => {
        if (kind === "transport") throw new Error("Disconnected");
        return new Response(JSON.stringify(result));
      });
      vi.stubGlobal("fetch", fetchMock);
      const h = harness();
      await h.run();
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(h.events().at(-1).type).toBe("error");
    }
  );
  it("rejects unsupported contracts and legacy zones before gateway calls", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const unsupported = createPuckGenerationCatalog({
      Invalid: { generation: { props: z.object({ open: z.any() }) } },
    });
    const invalid = harness(
      {
        layoutId: "location",
        messages: [{ role: "user", content: "Create page" }],
      },
      unsupported
    );
    await invalid.run();
    expect(invalid.response.statusCode).toBe(422);
    const zones = harness({
      layoutId: "location",
      currentData: { ...baseline, zones: { legacy: baseline.content } },
      messages: [{ role: "user", content: "Create page" }],
    });
    await zones.run();
    expect(zones.response.statusCode).toBe(409);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("accepts the complete gateway stream without publishing partial output", async () => {
    const text = JSON.stringify(proposal);
    const events = [
      ...text
        .match(/.{1,13}/g)!
        .map((delta) => ({ type: "response.output_text.delta", delta })),
      {
        type: "response.completed",
        response: { status: "completed", output_text: text },
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            events
              .map((event) => `data: ${JSON.stringify(event)}\n\n`)
              .join(""),
            { headers: { "Content-Type": "text/event-stream" } }
          )
      )
    );
    const h = harness();
    await h.run();
    expect(h.events()).toEqual([
      {
        type: "accepted",
        text: "Created",
        spec: {
          content: [
            { type: "Heading", props: { id: expect.any(String), text: "New" } },
          ],
        },
      },
    ]);
  });
  it("terminates deadline failures without attempting repair", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url, init) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal.addEventListener("abort", () =>
            reject(init.signal.reason)
          );
        })
    );
    vi.stubGlobal("fetch", fetchMock);
    const h = harness();
    const run = h.run();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await vi.advanceTimersByTimeAsync(5 * 60_000);
    await run;
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(h.events().at(-1)).toMatchObject({
      type: "error",
      error: expect.stringContaining("deadline"),
    });
  });
  it("cancels the gateway on disconnect without accepting late results", async () => {
    let resolve!: (response: Response) => void;
    let signal!: AbortSignal;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url, init) => {
        signal = init.signal;
        return new Promise<Response>((yes) => {
          resolve = yes;
        });
      })
    );
    const h = harness();
    const run = h.run();
    await vi.waitFor(() => expect(resolve).toBeDefined());
    h.response.destroyed = true;
    h.response.emit("close");
    resolve(completed(proposal));
    await run;
    expect(signal.aborted).toBe(true);
    expect(h.events().some((e) => e.type === "accepted")).toBe(false);
  });
});
