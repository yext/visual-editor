// @vitest-environment node
import {
  executionHarness,
  modelResponder,
} from "../../testing/modelFixtures.ts";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  EDIT_PLANNING_OUTPUT_TOKEN_BUDGET,
  SECTION_EDIT_OUTPUT_TOKEN_BUDGET,
} from "../../limits.ts";
import {
  editGenerationFixture,
  editPlan,
  planningResponse,
  editResponse,
  editTask,
} from "../../testing/editFixtures.ts";
import { createRequestLocalIds } from "../../shared/requestLocalIds.ts";
import { buildEditInventory } from "./buildEditInventory.ts";
import { completed as completedProvider } from "../../testing/modelFixtures.ts";
import { z } from "zod";
import { clone } from "../../shared/authoredValues.ts";
import { repairGenerationOutput } from "../../shared/generationErrors.ts";
import { executeGeneration } from "../../transport/executeGeneration.ts";
import { slottedFixture } from "../../testing/slottedFixtures.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
} from "./applyEditsToLayout.ts";
import { compileSectionEditSchema } from "./compileSectionEditSchema.ts";
import { compileEditPlanningSchema } from "./sectionEditPlanningSchema.ts";

const wirePlan = (plan: unknown) => {
  const fixture = editGenerationFixture();
  return planningResponse(plan, fixture.catalog, fixture.data);
};
const completed = (output: unknown) => completedProvider(wirePlan(output));

const harness = (changes: Record<string, unknown> = {}) => {
  const fixture = editGenerationFixture();
  const request = {
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
  };
  return Object.assign(
    executionHarness(request, fixture.catalog, ["en", "fr"]),
    { fixture }
  );
};

afterEach(() => {
  modelResponder.mockReset();
  vi.unstubAllGlobals();
});

describe("planning and section execution requests", () => {
  it("plans against current inventory, captured selection and conversation history", async () => {
    const h = harness();
    const ids = createRequestLocalIds(
      buildEditInventory(h.fixture.catalog, h.fixture.data).components.map(
        (item) => item.componentId
      )
    );
    const output = wirePlan(editPlan([editTask("first", ["first-b"])]));
    const fetchMock = vi.fn(async (_body: unknown, _signal?: AbortSignal) =>
      completed(output)
    );
    modelResponder.mockImplementation(fetchMock);
    await h.run();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(h.log).toHaveBeenCalledWith(
      "[layout generation] Planning response",
      expect.objectContaining({
        outputText: JSON.stringify(output),
      })
    );
    expect(h.error).toBeUndefined();
    const body = modelResponder.mock.calls[0][0];
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
    const latest = JSON.parse(body.input.at(-1)!.content);
    expect(latest.context.inventory).toMatchObject({
      selectedComponentId: ids.encode("first-b"),
      selectedSectionId: ids.encode("first"),
    });
    expect(body.input.at(-1)!.content).not.toContain("editorMetadata");
    expect(body.input.at(-1)!.content).not.toContain("Private root setting");
    expect(h.events().at(-1)).toMatchObject({
      type: "planned",
      plan: { tasks: [{ targetComponentIds: ["first-b"] }] },
    });
    expect(h.events().some((event) => "spec" in event && event.spec)).toBe(
      false
    );
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
      modelResponder.mockImplementation(fetchMock);
      const h = harness();
      await h.run();
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(h.events().at(-1)).toEqual({ type: "planned", plan: output });
    }
  );

  it("generates a narrow section result rather than a whole-page replacement", async () => {
    const task = editTask();
    const fetchMock = vi.fn(async (_body: unknown, _signal?: AbortSignal) =>
      completed(editResponse(task))
    );
    modelResponder.mockImplementation(fetchMock);
    const h = harness({
      mode: "section",
      task,
      sharedIntent: "Consistent marketing copy",
    });
    await h.run();
    const body = modelResponder.mock.calls[0][0];
    expect(body.text.format).toMatchObject({
      name: "puck_section_edit",
      strict: true,
    });
    expect(body.max_output_tokens).toBe(SECTION_EDIT_OUTPUT_TOKEN_BUDGET);
    expect(h.log).toHaveBeenCalledWith(
      "[layout generation] Section prompt",
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
    expect(JSON.parse(body.input.at(-1)!.content).context.sharedIntent).toBe(
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
    expect(h.events().some((event) => "spec" in event && event.spec)).toBe(
      false
    );
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
      modelResponder.mockImplementation(fetchMock);
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
    modelResponder.mockImplementation(fetchMock);
    const h = harness();
    const run = h.run();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const outputText = JSON.stringify(wirePlan(editPlan()));
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

  it("returns bounded repair feedback for invalid output", async () => {
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
    const fetchMock = vi.fn(async (_body: unknown, _signal?: AbortSignal) =>
      completed(invalid)
    );
    modelResponder.mockImplementation(fetchMock);
    const first = harness({ mode: "section", task });
    await first.run();
    expect(fetchMock).toHaveBeenCalledOnce();
    const error = first.error!;
    expect(error).toMatchObject({ retryable: true });
    expect(error.feedback.length).toBeLessThanOrEqual(4_000);
    expect(
      first.events().some((event) => event.type === "section-result")
    ).toBe(false);
    fetchMock.mockImplementation(async () => completed(editResponse(task)));
    const second = harness({
      mode: "section",
      task,
      validationFeedback: error.feedback,
    });
    await second.run();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const body = modelResponder.mock.calls[1][0];
    expect(JSON.parse(body.input.at(-1)!.content).validationFeedback).toBe(
      error.feedback
    );
    expect(second.log).toHaveBeenCalledWith(
      "[layout generation] Section prompt",
      expect.objectContaining({ validationFeedback: error.feedback })
    );
    expect(second.events().at(-1)!.type).toBe("section-result");
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
      modelResponder.mockImplementation(fetchMock);
      const h = harness(changes);
      await h.run();
      expect(h.error?.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("rejects stale or cross-section section tasks before generation", async () => {
    const fetchMock = vi.fn();
    modelResponder.mockImplementation(fetchMock);
    const h = harness({
      mode: "section",
      task: editTask("first", ["second-a"]),
    });
    await h.run();
    expect(h.error?.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("marks transport failures as non-repairable and logs the original cause chain", async () => {
    const socketError = new Error("Socket reset at the original failure site");
    const upstreamError = new Error("Disconnected", { cause: socketError });
    modelResponder.mockImplementation(
      vi.fn(async () => {
        throw upstreamError;
      })
    );
    const h = harness();
    await h.run();
    expect(h.error).toMatchObject({
      retryable: false,
      message: "Disconnected",
      transport: true,
    });
    const failure = h.log.mock.calls.find(
      ([message]) => message === "[layout generation] Generation failed"
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
      modelResponder.mockImplementation(
        vi.fn(
          async () =>
            new Response("Gateway failed", { status: status as number })
        )
      );
      const h = harness();
      await h.run();
      expect(h.error).toMatchObject({
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
      modelResponder.mockImplementation(
        vi.fn(
          async () =>
            new Response(stream, {
              headers: { "Content-Type": "text/event-stream" },
            })
        )
      );
      const h = harness();
      await h.run();
      expect(h.error).toMatchObject({
        retryable: false,
        transport: kind !== "refusal",
      });
    }
  );

  it.each(["refusal", "incomplete"])(
    "reports failure when a gateway response ends in %s",
    async (kind) => {
      modelResponder.mockImplementation(
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
      expect(h.events()).toEqual([]);
      expect(h.error).toMatchObject({
        retryable: false,
        transport: false,
      });
    }
  );

  it("cancels follow-up generation on cancellation and ignores late delivery", async () => {
    let resolve!: (response: Response) => void;
    let signal!: AbortSignal;
    modelResponder.mockImplementation(
      vi.fn((_body: unknown, requestSignal: AbortSignal) => {
        signal = requestSignal;
        return new Promise<Response>((yes) => {
          resolve = yes;
        });
      })
    );
    const h = harness();
    const run = h.run();
    await vi.waitFor(() => expect(resolve).toBeDefined());
    h.cancel();
    resolve(completed(editPlan()));
    await run;
    expect(signal.aborted).toBe(true);
    expect(h.events().some((event) => event.type === "planned")).toBe(false);
  });

  it("keeps the fourth card and its content requirements in the sole owning section task", async () => {
    const fixture = slottedFixture("ProductCard");
    const data = fixture.materialize();
    const before = clone(data);
    const sectionId = data.content[0].props.id;
    const task = editTask(
      sectionId,
      [],
      [
        {
          kind: "insert",
          insertionKey: "fashion-card",
          componentType: "ProductCard",
          collection: { ownerId: sectionId, slotPath: "/slots/CardSlot" },
          anchor: { position: "end" },
        },
      ]
    );
    task.instructions =
      "Keep snow, rain, and work boots in the three existing cards. Add a complete fourth card for fashion boots, including its image, title and description.";
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      data
    );
    const response = planningResponse(editPlan([task]), fixture.catalog, data);
    const wire = z.fromJSONSchema(compiled.jsonSchema);
    expect(wire.safeParse(response).success).toBe(true);
    expect(Object.values(response.existingTasks).filter(Boolean)).toHaveLength(
      1
    );
    expect(response.newSections).toEqual([]);
    // The old split-task shape cannot pass the provider schema or decoder.
    const split = editPlan([
      task,
      { ...task, taskId: "fashion-copy", structuralOperations: [] },
    ]);
    expect(wire.safeParse(split).success).toBe(false);
    expect(() => compiled.parseResponse(JSON.stringify(split))).toThrow();
    const originalRequest =
      "Create a boot page with snow, rain, work, and fashion boots. Keep all four categories.";
    const attempts: { request: string; validationFeedback?: string }[] = [];
    const accepted = await repairGenerationOutput((validationFeedback) =>
      executeGeneration(
        {
          mode: "plan",
          selectedComponentId: null,
          layoutId: "boots",
          currentData: data,
          messages: [{ role: "user", content: originalRequest }],
          validationFeedback,
        },
        {
          model: "test",
          locales: ["en", "fr"],
          catalog: fixture.catalog,
          diagnostics: { log: () => {}, report: () => {} },
          transport: async (body) => {
            attempts.push(JSON.parse(body.input.at(-1)!.content));
            const provider = completedProvider(
              attempts.length === 1 ? split : response
            );
            return { contentType: "application/json", body: provider.body! };
          },
        },
        new AbortController().signal,
        "repair-fourth-card"
      )
    );
    expect(attempts).toHaveLength(2);
    expect(attempts.map((attempt) => attempt.request)).toEqual([
      originalRequest,
      originalRequest,
    ]);
    expect(attempts[1].validationFeedback).toBeTruthy();
    if (accepted.type !== "planned")
      throw new Error("Expected the repaired plan");
    const plan = accepted.plan;
    expect(plan.tasks).toEqual([task]);
    const section = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      data,
      plan.tasks[0]
    );
    expect(section.context.task.instructions).toBe(task.instructions);
    const result = section.parseResponse(
      JSON.stringify({
        taskId: task.taskId,
        sectionId,
        updates: [],
        insertions: [
          {
            insertionKey: "fashion-card",
            component: fixture.card("Fashion boots", "pink"),
          },
        ],
      })
    );
    const candidate = materializeSectionEdit(
      fixture.catalog,
      data,
      task,
      result
    );
    const applied = preserveSectionEditResolution(
      fixture.catalog,
      await fixture.resolve(candidate),
      candidate
    );
    const cards = applied.content[0].props.slots.CardSlot;
    expect(cards).toHaveLength(4);
    expect(cards.slice(0, 3)).toEqual(data.content[0].props.slots.CardSlot);
    expect(cards[3].props.data.question.defaultValue).toBe("Fashion boots");
    expect(data).toEqual(before);
  });
});
