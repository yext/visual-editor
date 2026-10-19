// @vitest-environment node
import type { IncomingMessage, ServerResponse } from "node:http";
import { afterEach, describe, expect, it, vi } from "vitest";
import { handleLocalEditorGenerationRequest } from "./generation.ts";
import {
  EDIT_PLANNING_OUTPUT_TOKEN_BUDGET,
  SECTION_EDIT_OUTPUT_TOKEN_BUDGET,
} from "./generationLimits.ts";
import {
  completed,
  generationRequest,
  generationResponse,
  editGenerationFixture,
  editPlan,
  editTask,
  editResponse,
} from "./editGenerationTestUtils.ts";

const harness = (changes: Record<string, unknown> = {}) => {
  const fixture = editGenerationFixture();
  const request = generationRequest({
    layoutId: "location",
    currentData: fixture.data,
    mode: "plan",
    selectedComponentId: "first-b",
    messages: [
      { role: "user", content: "Earlier request" },
      { role: "assistant", content: "Earlier applied outcome" },
      {
        role: "user",
        content: "Change the second card in the first section",
      },
    ],
    ...changes,
  });
  const log = vi.fn();
  const response = generationResponse();
  return {
    fixture,
    log,
    request,
    response,
    run: () =>
      handleLocalEditorGenerationRequest(
        request as unknown as IncomingMessage,
        response as unknown as ServerResponse,
        {
          model: "test",
          loadContext: async () => ({
            catalog: fixture.catalog,
            locales: ["en", "fr"],
          }),
          log,
        }
      ),
    events: () => response.write.mock.calls.map(([line]) => JSON.parse(line)),
  };
};
afterEach(() => vi.unstubAllGlobals());

describe("planning and section execution requests", () => {
  it("plans against current inventory, captured selection and conversation history", async () => {
    const fetchMock = vi.fn(async (_url: unknown, _init?: RequestInit) =>
      completed(editPlan([editTask("first", ["first-b"])]))
    );
    vi.stubGlobal("fetch", fetchMock);
    const h = harness();
    await h.run();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(h.log).toHaveBeenCalledWith(
      "[local-editor generation] Planning response",
      expect.objectContaining({
        outputText: JSON.stringify(editPlan([editTask("first", ["first-b"])])),
      })
    );
    expect(h.response.statusCode).toBe(200);
    expect(h.response.setHeader).toHaveBeenCalledWith(
      "X-Visual-Editor-Generation",
      "section-edits-v1"
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body.text.format).toMatchObject({
      type: "json_schema",
      strict: true,
      name: "puck_edit_plan",
    });
    expect(body.max_output_tokens).toBe(EDIT_PLANNING_OUTPUT_TOKEN_BUDGET);
    expect(body.input[1]).toEqual({
      role: "assistant",
      content: "Earlier applied outcome",
    });
    const latest = JSON.parse(body.input.at(-1).content);
    expect(latest.context.inventory).toMatchObject({
      selectedComponentId: "first-b",
      selectedSectionId: "first",
    });
    expect(body.input.at(-1).content).not.toContain("editorMetadata");
    expect(body.input.at(-1).content).not.toContain("Private root setting");
    expect(h.events().at(-1)).toMatchObject({
      type: "planned",
      plan: { tasks: [{ targetComponentIds: ["first-b"] }] },
    });
    expect(h.events().some((event) => event.spec)).toBe(false);
    expect(h.events()[0]).toEqual({
      type: "usage",
      usage: { cachedInput: 8, uncachedInput: 12, output: 10 },
    });
  });

  it.each(["clarification", "globalStyle", "conversation"])(
    "returns %s without initiating section generation",
    async (intent) => {
      const output = {
        ...editPlan([]),
        intent,
        clarification: intent === "clarification" ? "Which card?" : null,
        globalStyleGuidance:
          intent === "globalStyle" ? "Use the global style editor." : null,
      };
      const fetchMock = vi.fn(async () => completed(output));
      vi.stubGlobal("fetch", fetchMock);
      const h = harness();
      await h.run();
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(h.events().at(-1)).toEqual({ type: "planned", plan: output });
    }
  );

  it("generates a narrow section result rather than a whole-page replacement", async () => {
    const task = editTask();
    const fetchMock = vi.fn(async (_url: unknown, _init?: RequestInit) =>
      completed(editResponse(task))
    );
    vi.stubGlobal("fetch", fetchMock);
    const h = harness({
      mode: "section",
      task,
      sharedIntent: "Consistent marketing copy",
    });
    await h.run();
    const body = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(body.text.format).toMatchObject({
      name: "puck_section_edit",
      strict: true,
    });
    expect(body.max_output_tokens).toBe(SECTION_EDIT_OUTPUT_TOKEN_BUDGET);
    expect(h.log).toHaveBeenCalledWith(
      "[local-editor generation] Section prompt",
      expect.objectContaining({
        taskId: task.taskId,
        sectionId: task.sectionId,
        instructions: body.instructions,
        userPrompt: "Change the second card in the first section",
        task,
        sharedIntent: "Consistent marketing copy",
      })
    );
    expect(JSON.stringify(body.text.format.schema)).not.toContain(
      "unrelatedValue"
    );
    expect(JSON.parse(body.input.at(-1).content).context.sharedIntent).toBe(
      "Consistent marketing copy"
    );
    expect(h.events().at(-1)).toMatchObject({
      type: "section-result",
      result: {
        taskId: task.taskId,
        sectionId: task.sectionId,
        operations: [{ kind: "update", componentId: "first-a" }],
      },
    });
    expect(h.events().some((event) => event.spec)).toBe(false);
  });

  it.each(["remove", "reorder"] as const)(
    "returns pure %s tasks without a gateway request",
    async (kind) => {
      const task = {
        ...editTask(
          "first",
          ["first-a"],
          [
            kind === "remove"
              ? { kind, componentId: "first-a" }
              : {
                  kind,
                  componentId: "first-a",
                  anchor: { position: "after", componentId: "first-b" },
                },
          ]
        ),
        generateContent: false,
      };
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);
      const h = harness({ mode: "section", task });
      await h.run();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(h.events()).toEqual([
        {
          type: "section-result",
          result: {
            taskId: task.taskId,
            sectionId: task.sectionId,
            operations: task.structuralOperations,
          },
        },
      ]);
      expect(
        h.fixture.data.content[1].props.content[0].props.cards
      ).toHaveLength(2);
    }
  );

  it("publishes no plan until a gateway stream completes and validates", async () => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start(value) {
        controller = value;
      },
    });
    const fetchMock = vi.fn(
      async () =>
        new Response(stream, {
          headers: { "Content-Type": "text/event-stream" },
        })
    );
    vi.stubGlobal("fetch", fetchMock);
    const h = harness();
    const run = h.run();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const outputText = JSON.stringify(editPlan());
    controller.enqueue(
      new TextEncoder().encode(
        `data: ${JSON.stringify({ type: "response.output_text.delta", delta: outputText.slice(0, 20) })}\n\n`
      )
    );
    expect(h.events()).toEqual([]);
    controller.enqueue(
      new TextEncoder().encode(
        `data: ${JSON.stringify({ type: "response.output_text.delta", delta: outputText.slice(20) })}\n\ndata: ${JSON.stringify({ type: "response.completed", response: { status: "completed", output_text: outputText } })}\n\n`
      )
    );
    controller.close();
    await run;
    expect(h.events()).toEqual([{ type: "planned", plan: editPlan() }]);
  });

  it("returns bounded repair feedback for invalid output and counts each separate request's usage", async () => {
    const task = editTask();
    const invalid = {
      ...editResponse(task),
      updates: [
        {
          kind: "update",
          componentId: "first-b",
          changes: [
            { kind: "set", path: "/text/defaultValue", value: "Wrong target" },
          ],
        },
      ],
    };
    const fetchMock = vi.fn(async (_url: unknown, _init?: RequestInit) =>
      completed(invalid)
    );
    vi.stubGlobal("fetch", fetchMock);
    const first = harness({ mode: "section", task });
    await first.run();
    expect(fetchMock).toHaveBeenCalledOnce();
    const error = first.events().at(-1);
    expect(error).toMatchObject({ type: "error", retryable: true });
    expect(error.validationFeedback.length).toBeLessThanOrEqual(4_000);
    expect(
      first.events().some((event) => event.type === "section-result")
    ).toBe(false);
    fetchMock.mockImplementation(async () => completed(editResponse(task)));
    const second = harness({
      mode: "section",
      task,
      validationFeedback: error.validationFeedback,
    });
    await second.run();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const body = JSON.parse(fetchMock.mock.calls[1][1]!.body as string);
    expect(JSON.parse(body.input.at(-1).content).validationFeedback).toBe(
      error.validationFeedback
    );
    const usage = [...first.events(), ...second.events()]
      .filter((event) => event.type === "usage")
      .reduce((sum, event) => sum + event.usage.output, 0);
    expect(second.log).toHaveBeenCalledWith(
      "[local-editor generation] Section prompt",
      expect.objectContaining({ validationFeedback: error.validationFeedback })
    );
    expect(usage).toBe(20);
    expect(second.events().at(-1).type).toBe("section-result");
  });

  it.each([
    { mode: "unknown" },
    { mode: "section", task: undefined },
    { currentData: undefined },
    { validationFeedback: "x".repeat(4_001) },
  ])(
    "rejects malformed request context before the gateway",
    async (changes) => {
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);
      const h = harness(changes);
      await h.run();
      expect(h.response.statusCode).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("rejects stale or cross-section section tasks before generation", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const h = harness({
      mode: "section",
      task: editTask("first", ["second-a"]),
    });
    await h.run();
    expect(h.response.statusCode).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("marks transport failures as non-repairable and logs the original cause chain", async () => {
    const socketError = new Error("Socket reset at the original failure site");
    const upstreamError = new Error("Disconnected", { cause: socketError });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw upstreamError;
      })
    );
    const h = harness();
    await h.run();
    expect(h.events().at(-1)).toMatchObject({
      type: "error",
      retryable: false,
      error: "Disconnected",
      transport: true,
    });
    const failure = h.log.mock.calls.find(
      ([message]) => message === "[local-editor generation] Generation failed"
    )![1];
    expect(failure.stack).toContain(upstreamError.stack);
    expect(failure.stack).toContain(socketError.stack);
  });

  it.each([
    [503, true],
    [429, true],
    [400, false],
  ])(
    "classifies gateway HTTP %s failures for browser coordination",
    async (status, transport) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(
          async () =>
            new Response("Gateway failed", { status: status as number })
        )
      );
      const h = harness();
      await h.run();
      expect(h.events().at(-1)).toMatchObject({
        type: "error",
        retryable: false,
        transport,
      });
    }
  );

  it.each(["broken", "truncated", "refusal"])(
    "classifies a %s gateway stream without making it repairable",
    async (kind) => {
      const stream = new ReadableStream({
        start(controller) {
          if (kind === "broken") {
            controller.error(new Error("Connection lost"));
          } else {
            if (kind === "refusal") {
              controller.enqueue(
                new TextEncoder().encode(
                  'data: {"type":"response.refusal.done"}\n\n'
                )
              );
            }
            controller.close();
          }
        },
      });
      vi.stubGlobal(
        "fetch",
        vi.fn(
          async () =>
            new Response(stream, {
              headers: { "Content-Type": "text/event-stream" },
            })
        )
      );
      const h = harness();
      await h.run();
      expect(h.events().at(-1)).toMatchObject({
        type: "error",
        retryable: false,
        transport: kind !== "refusal",
      });
    }
  );

  it.each(["refusal", "incomplete"])(
    "keeps reported usage when a completed gateway response ends in %s",
    async (kind) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(
          async () =>
            new Response(
              JSON.stringify({
                status: kind === "incomplete" ? "incomplete" : "completed",
                incomplete_details:
                  kind === "incomplete"
                    ? { reason: "max_output_tokens" }
                    : undefined,
                output:
                  kind === "refusal"
                    ? [{ type: "message", content: [{ type: "refusal" }] }]
                    : [],
                usage: {
                  input_tokens: 20,
                  input_tokens_details: { cached_tokens: 8 },
                  output_tokens: 10,
                },
              }),
              { headers: { "Content-Type": "application/json" } }
            )
        )
      );
      const h = harness();
      await h.run();
      expect(h.events()[0]).toEqual({
        type: "usage",
        usage: { cachedInput: 8, uncachedInput: 12, output: 10 },
      });
      expect(h.events().at(-1)).toMatchObject({
        type: "error",
        retryable: false,
        transport: false,
      });
    }
  );

  it("cancels follow-up generation on disconnect and ignores late delivery", async () => {
    let resolve!: (response: Response) => void;
    let signal!: AbortSignal;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: unknown, init: RequestInit) => {
        signal = init.signal!;
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
    resolve(completed(editPlan()));
    await run;
    expect(signal.aborted).toBe(true);
    expect(h.events().some((event) => event.type === "planned")).toBe(false);
  });
});
