import {
  testPrompts,
  testGenerationSettings,
  readTestPromptComponents,
} from "../testing/promptFixtures.ts";
import { GenerationError } from "../shared/generationErrors.ts";
import { executionHarness, modelResponder } from "../testing/modelFixtures.ts";
// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { compileGenerationSchema } from "../workflows/fullPageGeneration/pageSchema.ts";

import {
  clarificationResponse,
  creationResponse,
} from "../testing/editFixtures.ts";
import { completed } from "../testing/modelFixtures.ts";

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
const proposal = creationResponse([
  { type: "Heading", props: { text: "New" } },
]);
const harness = (
  body: object = {
    layoutId: "location",
    currentData: { content: [] },
    messages: [{ role: "user", content: "Create page" }],
  },
  c = catalog,
  locales = ["en"],
  generationSettings = testGenerationSettings
) => {
  return executionHarness(body, c, locales, generationSettings);
};

afterEach(() => {
  modelResponder.mockReset();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it.each(["create", "fullPageUpdate"] as const)(
  "sends layout recommendations in both the %s prompt and request context",
  async (mode) => {
    const c = createPuckGenerationCatalog(
      {
        Heading: {
          generation: { props: z.object({ text: z.string().min(1) }) },
          defaultProps: { text: "Default" },
        },
        Extra: {
          generation: { props: z.object({ text: z.string().min(1) }) },
          defaultProps: { text: "Default" },
        },
      },
      { defaultGenerationSectionIds: ["Heading"] }
    );
    modelResponder.mockImplementation(async () =>
      completed(
        mode === "create"
          ? proposal
          : {
              translationMode: "defaultOnly",
              result: {
                action: "fullPageUpdate",
                steps: [{ kind: "keep", sectionId: "heading" }],
              },
              text: "Kept.",
            }
      )
    );
    const h = harness(
      {
        mode,
        layoutId: "location",
        currentData: mode === "create" ? { content: [] } : baseline,
        messages: [{ role: "user", content: "Build a service page" }],
      },
      c
    );
    await h.run();
    expect(h.error).toBeUndefined();
    const sent = modelResponder.mock.calls[0][0];
    expect(
      JSON.parse(sent.input.at(-1)!.content).context.recommendedSectionIds
    ).toEqual(["Heading"]);
    expect(sent.instructions).toContain(
      mode === "create"
        ? 'CREATE_RECOMMENDATIONS ["Heading"]'
        : 'FULL_PAGE_UPDATE_RECOMMENDATIONS ["Heading"]'
    );
    expect(sent.instructions).toContain("Extra");
  }
);

it.each(["create", "fullPageUpdate"] as const)(
  "preserves draft content and conversation through %s",
  async (mode) => {
    const draft =
      "[Content needed: verified expert quote about knee pain treatment]";
    const sections = [{ type: "Heading", props: { text: draft } }];
    modelResponder.mockImplementation(async () =>
      completed(
        mode === "create"
          ? creationResponse(sections)
          : {
              translationMode: "defaultOnly",
              result: {
                action: "fullPageUpdate",
                steps: [{ kind: "replace", sectionId: "heading", sections }],
              },
              text: "Expert insights needs a verified quote.",
            }
      )
    );
    const h = harness({
      mode,
      layoutId: "location",
      currentData: mode === "create" ? { content: [] } : baseline,
      messages: [
        {
          role: "user",
          content: "Explain who treats knee pain, with expert insights",
        },
        { role: "assistant", content: "Translate this page?" },
        { role: "user", content: "No translations" },
      ],
    });
    await h.run();
    expect(h.error).toBeUndefined();
    const sent = modelResponder.mock.calls[0][0];
    expect(
      sent.instructions.startsWith(
        mode === "create" ? "CREATE\n" : "FULL_PAGE_UPDATE\n"
      )
    ).toBe(true);
    expect(sent.instructions).not.toContain(
      "Explain who treats knee pain, with expert insights"
    );
    expect(sent.instructions).not.toContain("No translations");
    expect(sent.input[0]).toEqual({
      role: "user",
      content: "Explain who treats knee pain, with expert insights",
    });
    expect(JSON.parse(sent.input.at(-1)!.content).request).toBe(
      "No translations"
    );
    expect(h.events().at(-1)).toMatchObject(
      mode === "create"
        ? { type: "accepted", spec: { content: [{ props: { text: draft } }] } }
        : {
            type: "fullPageUpdated",
            result: { steps: [{ sections: [{ props: { text: draft } }] }] },
          }
    );
  }
);

it.each(["create", "fullPageUpdate"] as const)(
  "scopes explicit-content schemas and reference defaults to workflow %s",
  async (mode) => {
    const c = createPuckGenerationCatalog({
      Heading: {
        generation: {
          props: z.object({
            text: z.string().describe("Write displayed copy in this field."),
            styles: z.object({ color: z.string() }),
          }),
        },
        fields: { text: { type: "text" } },
        description: "Introduce the topic when an introduction is useful.",
        defaultProps: {
          text: "Sample offer for $99",
          styles: { color: "primary" },
        },
      },
    });
    const sections = [
      {
        type: "Heading",
        props: { text: { $default: true }, styles: { $default: true } },
      },
    ];
    modelResponder.mockImplementation(async () =>
      completed(
        mode === "create"
          ? creationResponse(sections)
          : {
              translationMode: "defaultOnly",
              result: {
                action: "fullPageUpdate",
                steps: [{ kind: "replace", sectionId: "heading", sections }],
              },
              text: "Updated",
            }
      )
    );
    const h = harness(
      {
        mode,
        layoutId: "location",
        currentData:
          mode === "create"
            ? { content: [] }
            : {
                content: [
                  {
                    type: "Heading",
                    props: {
                      id: "heading",
                      ...c.data.components.Heading.defaultProps,
                    },
                  },
                ],
              },
        messages: [{ role: "user", content: "Create a service page" }],
      },
      c
    );
    await h.run();
    const sent = modelResponder.mock.calls[0][0];
    const references = readTestPromptComponents(sent.instructions);
    expect(JSON.stringify(sent.text.format.schema)).toContain(
      "Write displayed copy in this field."
    );
    expect(references.Heading.description).toBe(
      c.data.components.Heading.description
    );
    if (mode === "fullPageUpdate") {
      expect(h.error).toBeDefined();
      expect(references.Heading.defaults).toEqual({
        styles: { color: "primary" },
      });
      expect(sent.instructions).not.toContain("Sample offer for $99");
    } else {
      expect(h.error).toBeUndefined();
      expect(references.Heading.defaults.text).toBe("Sample offer for $99");
    }
  }
);

describe("strict request execution", () => {
  it("carries preparation in the creation request and its diagnostics", async () => {
    modelResponder.mockImplementation(async () => completed(proposal));
    const preparation = {
      question: null,
      translationMode: "defaultOnly",
      cardCounts: [],
    };
    const h = harness({
      mode: "create",
      layoutId: "location",
      currentData: { content: [] },
      messages: [{ role: "user", content: "Create a page" }],
      preparation,
    });
    await h.run();
    expect(h.error).toBeUndefined();
    expect(
      JSON.parse(modelResponder.mock.calls[0][0].input.at(-1)!.content)
        .preparation
    ).toEqual(preparation);
    expect(h.log).toHaveBeenCalledWith(
      "[layout generation] Gateway request",
      expect.objectContaining({ mode: "create", preparation })
    );
  });

  it("asks preparation questions using a small schema before loading component contracts", async () => {
    const c = createPuckGenerationCatalog({
      Uncompilable: {
        generation: { props: z.object({ unsupported: z.custom() }) },
      },
    });
    const preparation = {
      question: "Translate into Spanish?",
      translationMode: null,
      cardCounts: [],
    };
    const fetchMock = vi.fn(async () => completed(preparation));
    modelResponder.mockImplementation(fetchMock);
    const h = harness(
      {
        mode: "prepare",
        layoutId: "location",
        currentData: { content: [] },
        messages: [{ role: "user", content: "Create a page" }],
      },
      c,
      ["en", "es"]
    );
    await h.run();
    const body = modelResponder.mock.calls[0][0];
    expect(body.text.format.name).toBe("puck_generation_preparation");
    expect(JSON.stringify(body.text.format.schema).length).toBeLessThan(6000);
    expect(h.events().at(-1)).toEqual({ type: "prepared", preparation });
    expect(body.instructions).toBe(testPrompts.prompts.prepare);
  });

  it("passes page-set locales and prior translation decisions to generation and pauses on a translation question", async () => {
    const fetchMock = vi.fn(async () =>
      completed(
        clarificationResponse("Would you like French translations too?")
      )
    );
    modelResponder.mockImplementation(fetchMock);
    const messages = [{ role: "user", content: "Create a location page" }];
    const h = harness(
      { layoutId: "location", currentData: { content: [] }, messages },
      catalog,
      ["en", "fr"]
    );
    await h.run();
    const body = modelResponder.mock.calls[0][0];
    expect(JSON.parse(body.input.at(-1)!.content).context.locales).toEqual([
      "en",
      "fr",
    ]);
    expect(h.events().at(-1)).toMatchObject({
      type: "accepted",
      text: "Would you like French translations too?",
      spec: null,
    });

    const confirmed = harness(
      {
        layoutId: "location",
        currentData: { content: [] },
        messages: [
          ...messages,
          {
            role: "assistant",
            content: "Would you like French translations too?",
          },
          { role: "user", content: "Yes, translate to French" },
        ],
      },
      catalog,
      ["en", "fr"]
    );
    await confirmed.run();
    const confirmedBody = modelResponder.mock.calls[1][0];
    expect(confirmedBody.input.slice(0, -1)).toEqual([
      ...messages,
      { role: "assistant", content: "Would you like French translations too?" },
    ]);
    expect(JSON.parse(confirmedBody.input.at(-1)!.content).request).toBe(
      "Yes, translate to French"
    );
  });

  it("sends a gateway-enforced schema and accepts only a complete materialized candidate", async () => {
    const fetchMock = vi.fn(async () => completed(proposal));
    modelResponder.mockImplementation(fetchMock);
    const h = harness();
    await h.run();
    expect(fetchMock).toHaveBeenCalledOnce();
    const body = modelResponder.mock.calls[0][0];
    expect(body.text.format).toMatchObject({
      type: "json_schema",
      strict: true,
    });
    const localSchema = compileGenerationSchema(catalog, ["en"]).jsonSchema;
    expect(body.text.format.schema).toEqual(localSchema);
    expect(body.input.at(-1)!.content).not.toContain('"extra"');
    expect(h.events().find((e) => e.type === "accepted")!.spec).toEqual({
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
      currentData: h.events().find((event) => event.type === "accepted")!.spec,
      messages: [{ role: "user", content: "Create another page" }],
    });
    await subsequent.run();
    expect(subsequent.error?.status).toBe(409);
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
        completed(clarificationResponse("Which content?"))
      );
      modelResponder.mockImplementation(fetchMock);
      const h = harness({
        layoutId: "location",
        currentData,
        messages: [{ role: "user", content: "Generate a fresh page" }],
      });
      await h.run();
      expect(fetchMock).toHaveBeenCalledOnce();
      const requestBody = modelResponder.mock.calls[0][0];
      expect(requestBody.max_output_tokens).toBe(
        testGenerationSettings.maxOutputTokens.page
      );
      expect(h.events().at(-1)).toMatchObject({
        type: "accepted",
        text: "Which content?",
        spec: null,
      });
    }
  );
  it.each(["populated MainContent", "nonblank", "redesign"])(
    "rejects %s with 409 before the gateway",
    async (kind) => {
      const fetchMock = vi.fn();
      modelResponder.mockImplementation(fetchMock);
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
              kind === "redesign"
                ? "Redesign the entire page"
                : "Create a page",
          },
        ],
      });
      await h.run();
      expect(h.error?.status).toBe(409);
      expect(h.error?.message).toContain("blank page");
      expect(fetchMock).not.toHaveBeenCalled();
      expect(h.events()).toEqual([]);
    }
  );
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
    modelResponder.mockImplementation(fetchMock);
    const h = harness();
    await h.run();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(h.error).toBeInstanceOf(GenerationError);
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
        if (kind === "transport") {
          throw new Error("Disconnected");
        }
        return new Response(JSON.stringify(result));
      });
      modelResponder.mockImplementation(fetchMock);
      const h = harness();
      await h.run();
      expect(fetchMock).toHaveBeenCalledOnce();
      expect(h.error).toBeInstanceOf(GenerationError);
    }
  );
  it("rejects unsupported contracts and legacy zones before gateway calls", async () => {
    const fetchMock = vi.fn();
    modelResponder.mockImplementation(fetchMock);
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
    expect(invalid.error?.status).toBe(422);
    const zones = harness({
      layoutId: "location",
      currentData: { ...baseline, zones: { legacy: baseline.content } },
      messages: [{ role: "user", content: "Create page" }],
    });
    await zones.run();
    expect(zones.error?.status).toBe(409);
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
    modelResponder.mockImplementation(
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
  it("uses the configured attempt deadline and stops without repair", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_body, signal) =>
        new Promise<Response>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason));
        })
    );
    modelResponder.mockImplementation(fetchMock);
    const h = harness(undefined, catalog, ["en"], {
      ...testGenerationSettings,
      attemptTimeoutMs: 100,
    });
    const run = h.run();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    await vi.advanceTimersByTimeAsync(100);
    await run;
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(h.error).toMatchObject({
      message: expect.stringContaining("deadline"),
    });
  });
  it("cancels the gateway on cancellation without accepting late results", async () => {
    let resolve!: (response: Response) => void;
    let signal!: AbortSignal;
    modelResponder.mockImplementation(
      vi.fn((_body, requestSignal) => {
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
    resolve(completed(proposal));
    await run;
    expect(signal.aborted).toBe(true);
    expect(h.events().some((e) => e.type === "accepted")).toBe(false);
  });
});

const budgetRejected = (
  contentType: string,
  usage: object = { input_tokens: 0, output_tokens: 0 },
  delta = ""
) => {
  const response = {
    status: "incomplete",
    incomplete_details: { reason: "max_output_tokens" },
    usage,
  };
  const wire =
    contentType === "application/json"
      ? JSON.stringify(response)
      : (delta
          ? `data: ${JSON.stringify({ type: "response.output_text.delta", delta })}\n\n`
          : "") +
        `data: ${JSON.stringify({ type: "response.incomplete", response })}\n\n`;
  return new Response(wire, { headers: { "Content-Type": contentType } });
};
const fullPageUpdateRequest = () => ({
  mode: "fullPageUpdate",
  layoutId: "location",
  currentData: baseline,
  messages: [{ role: "user", content: "Focus on our product" }],
});
it.each(["application/json", "text/event-stream"])(
  "reports an output-budget rejection in %s without retrying at another allowance",
  async (contentType) => {
    modelResponder.mockResolvedValueOnce(budgetRejected(contentType));
    const generationSettings = {
      ...testGenerationSettings,
      maxOutputTokens: {
        ...testGenerationSettings.maxOutputTokens,
        page: 99_999,
      },
    };
    const h = harness(
      fullPageUpdateRequest(),
      catalog,
      ["en"],
      generationSettings
    );
    await h.run();
    expect(modelResponder).toHaveBeenCalledOnce();
    expect(modelResponder.mock.calls[0][0].max_output_tokens).toBe(99_999);
    expect(h.error).toMatchObject({
      retryable: false,
      message: expect.stringContaining("before generating any content"),
    });
  }
);
