import type { Data } from "@puckeditor/core";
import { expect, it, vi } from "vitest";
import { clone, type Content } from "../../shared/authoredValues.ts";
import type {
  GenerationEnvironment,
  GenerationRequestExecutor,
} from "../../shared/contracts.ts";
import { GenerationError } from "../../shared/generationErrors.ts";
import { creationCatalog, heading } from "../../testing/creationFixtures.ts";
import { slottedFixture } from "../../testing/slottedFixtures.ts";
import { executeGeneration } from "../../transport/executeGeneration.ts";
import { preserveSectionEditResolution } from "../edits/applyEditsToLayout.ts";
import { applyRegenerationStep } from "./applyRegenerationStep.ts";
import type { RegenerationStep } from "./contracts.ts";
import { compileRegenerationSchema } from "./pageSchema.ts";
import { RegenerationSession } from "./RegenerationSession.ts";
import { runRegeneration } from "./runRegeneration.ts";

const savedHeading = (id: string) => ({
  type: "Heading",
  props: { id, text: id },
  readOnly: { unused: true },
});
const newHeading = (id: string) => ({
  type: "Heading",
  props: { id, text: id },
});
const original = (): Data => ({
  root: { props: { title: "Untouched root" } },
  zones: {},
  content: [
    savedHeading("header"),
    {
      type: "MainContent",
      props: {
        id: "main",
        content: [
          savedHeading("hero"),
          savedHeading("services"),
          savedHeading("testimonials"),
        ],
      },
    },
    savedHeading("footer"),
  ],
});
const response = (steps: unknown[], translationMode = "defaultOnly") => ({
  translationMode,
  result: { action: "regenerate", steps },
  text: "Page regenerated.",
});
const bodySections = (data: Content) =>
  data.content.find((item) => item.type === "MainContent")!.props
    .content as Content["content"];
const fixture = () => {
  const catalog = creationCatalog();
  let data = original();
  const commit = vi.fn((next: Data, _baseline: Data) => {
    data = next;
  });
  const preview = vi.fn((next: Data) => {
    data = next;
  });
  const adapter = {
    read: () => data,
    resolve: vi.fn(async (candidate: Data) => candidate),
    validate: vi.fn(),
    preview,
    commit,
    materializeRegeneration: (baseline: Data, step: RegenerationStep) =>
      applyRegenerationStep(catalog, baseline as Content, step) as Data,
    preserveSectionResolution: (resolved: Data, candidate: Data) =>
      preserveSectionEditResolution(
        catalog,
        resolved as Content,
        candidate as Content
      ) as Data,
  };
  const session = new RegenerationSession(adapter, clone(data));
  return { catalog, session, adapter, commit, preview, data: () => data };
};

it("compiles full-page context and generates stable replacement identities with preserved remainder", () => {
  const catalog = creationCatalog();
  const baseline = original() as Content;
  const compiled = compileRegenerationSchema(catalog, ["en", "fr"], baseline);
  expect(
    bodySections(compiled.context.layout).map((item) => item.props.text)
  ).toEqual(["hero", "services", "testimonials"]);
  expect(compiled.context.layout.content[0]).not.toHaveProperty("readOnly");
  expect(
    compiled.context.inventory.components.map((item) => item.componentId)
  ).toContain("footer");
  expect(compiled.context.locales).toEqual(["en", "fr"]);
  expect(compiled.availableComponentNames).toContain("Heading");
  expect(JSON.stringify(compiled.jsonSchema)).toContain('"text"');
  const wire = JSON.stringify(
    response([
      { kind: "replace", sectionId: "hero", sections: [heading("Product")] },
    ])
  );
  const parsed = compiled.parseResponse(wire);
  expect(compiled.parseResponse(wire)).toEqual(parsed);
  const step = parsed.result.steps[0] as RegenerationStep;
  const next = applyRegenerationStep(catalog, baseline, step);
  expect(bodySections(next).map((item) => item.props.text)).toEqual([
    "Product",
    "services",
    "testimonials",
  ]);
  expect(bodySections(next)[0].props.id).toMatch(/^generated-/);
  expect(next.content[0]).toEqual(baseline.content[0]);
  expect(next.content[2]).toEqual(baseline.content[2]);
  expect((next as Data).root).toEqual((baseline as Data).root);
  expect(bodySections(baseline)[0].props.text).toBe("hero");
});

it("applies keep, deletion, insertion, and reordering without modifying saved metadata", () => {
  const catalog = creationCatalog();
  let data = original() as Content;
  data = applyRegenerationStep(catalog, data, {
    kind: "keep",
    sectionId: "header",
  });
  data = applyRegenerationStep(catalog, data, {
    kind: "remove",
    sectionId: "services",
  });
  expect(bodySections(data).map((item) => item.props.id)).toEqual([
    "hero",
    "testimonials",
  ]);
  data = applyRegenerationStep(catalog, data, {
    kind: "reorder",
    sectionId: "testimonials",
    anchor: { position: "before", componentId: "hero" },
  });
  expect(bodySections(data)[0]).toEqual(bodySections(original() as Content)[2]);
  data = applyRegenerationStep(catalog, data, {
    kind: "insert",
    collection: { ownerId: "main", slotPath: "/content" },
    anchor: { position: "end" },
    sections: [newHeading("new")],
  });
  expect(bodySections(data).map((item) => item.props.id)).toEqual([
    "testimonials",
    "hero",
    "new",
  ]);
  expect(data.content[2].props.id).toBe("footer");
});

it.each([
  { kind: "remove", sectionId: "main" },
  { kind: "remove", sectionId: "missing" },
  {
    kind: "reorder",
    sectionId: "hero",
    anchor: { position: "before", componentId: "footer" },
  },
  {
    kind: "insert",
    collection: { ownerId: "hero", slotPath: "/content" },
    anchor: { position: "end" },
    sections: [newHeading("new")],
  },
  {
    kind: "insert",
    collection: { ownerId: "main", slotPath: "/content" },
    anchor: { position: "end" },
    sections: [{ type: "MainContent", props: { id: "new", content: [] } }],
  },
  { kind: "replace", sectionId: "hero", sections: [newHeading("services")] },
] as RegenerationStep[])(
  "rejects invalid step $kind without mutating the page",
  (step) => {
    const baseline = original() as Content;
    const before = clone(baseline);
    expect(() =>
      applyRegenerationStep(creationCatalog(), baseline, step)
    ).toThrow();
    expect(baseline).toEqual(before);
  }
);

it.each(["delete", "insert", "edit"])(
  "enforces %s permission for replacement",
  (permission) => {
    expect(() =>
      applyRegenerationStep(
        creationCatalog(),
        original() as Content,
        { kind: "replace", sectionId: "hero", sections: [newHeading("new")] },
        (requested) => requested !== permission
      )
    ).toThrow("permission denied");
  }
);

it("respects root placement restrictions, read-only slots, and drag permissions", () => {
  const catalog = creationCatalog();
  catalog.puckOptions.rootAllowedComponentIds = ["MainContent"];
  expect(() =>
    applyRegenerationStep(catalog, original() as Content, {
      kind: "insert",
      collection: { ownerId: null, slotPath: null },
      anchor: { position: "end" },
      sections: [newHeading("new")],
    })
  ).toThrow("not permitted");
  const data = original() as Content;
  data.content[1].readOnly = { content: true };
  expect(() =>
    applyRegenerationStep(creationCatalog(), data, {
      kind: "remove",
      sectionId: "hero",
    })
  ).toThrow("read-only");
  expect(() =>
    applyRegenerationStep(
      creationCatalog(),
      original() as Content,
      { kind: "reorder", sectionId: "hero", anchor: { position: "end" } },
      (permission) => permission !== "drag"
    )
  ).toThrow("permission denied");
});

it.each(["defaultOnly", "translate"])(
  "materializes nested slots, card sources and %s text",
  (translationMode) => {
    const slotted = slottedFixture();
    const baseline = slotted.materialize();
    const compiled = compileRegenerationSchema(
      slotted.catalog,
      ["en", "fr"],
      baseline
    );
    const result = compiled.parseResponse(
      JSON.stringify(
        response(
          [
            {
              kind: "replace",
              sectionId: baseline.content[0].props.id,
              sections: [
                slotted.section([
                  {
                    ...slotted.card(),
                    props: {
                      ...slotted.card().props,
                      slots: {
                        BodySlot: [
                          { type: "Text", props: { text: "Product details" } },
                        ],
                      },
                    },
                  },
                ]),
              ],
            },
          ],
          translationMode
        )
      )
    );
    const next = applyRegenerationStep(
      slotted.catalog,
      baseline,
      result.result.steps[0]
    );
    const card = next.content[0].props.slots.CardSlot[0];
    expect(card.props.id).toMatch(/^generated-/);
    expect(card.props.slots.BodySlot[0].props.id).not.toBe("copied-child");
    expect(card.props.data.question.fr).toBe(
      translationMode === "translate" ? "Traduction" : undefined
    );
  }
);

it("preserves a newly generated entity-linked source through materialization", () => {
  const slotted = slottedFixture();
  const baseline = slotted.materialize();
  const compiled = compileRegenerationSchema(slotted.catalog, ["en"], baseline);
  const result = compiled.parseResponse(
    JSON.stringify(
      response([
        {
          kind: "replace",
          sectionId: baseline.content[0].props.id,
          sections: [slotted.section([], slotted.linked)],
        },
      ])
    )
  );
  const next = applyRegenerationStep(
    slotted.catalog,
    baseline,
    result.result.steps[0]
  );
  expect(next.content[0].props.data.field).toBe("c_items");
  expect(next.content[0].props.data.mappings.question.field).toBe("name");
});

it("retains completed streamed changes on stop with one undo baseline", async () => {
  const current = fixture();
  const signal = new AbortController().signal;
  await current.session.apply(
    { kind: "remove", sectionId: "services" },
    0,
    signal
  );
  expect(
    bodySections(current.data() as Content).map((item) => item.props.id)
  ).toEqual(["hero", "testimonials"]);
  expect(current.data().content[2].props.id).toBe("footer");
  await current.session.apply(
    {
      kind: "reorder",
      sectionId: "testimonials",
      anchor: { position: "start" },
    },
    1,
    signal
  );
  expect(current.commit).not.toHaveBeenCalled();
  current.session.finish();
  current.session.finish();
  expect(current.commit).toHaveBeenCalledOnce();
  expect(current.commit.mock.calls[0][1]).toEqual(original());
  expect(bodySections(current.data() as Content)[0].props.id).toBe(
    "testimonials"
  );
});

it("deduplicates steps and prevents late resolution after cancellation", async () => {
  const current = fixture();
  const controller = new AbortController();
  const step: RegenerationStep = { kind: "remove", sectionId: "services" };
  await current.session.apply(step, 0, controller.signal);
  await current.session.apply(step, 0, controller.signal);
  expect(current.preview).toHaveBeenCalledOnce();
  let release!: (data: Data) => void;
  current.adapter.resolve.mockImplementationOnce(
    (data) =>
      new Promise((resolve) => {
        release = () => resolve(data);
      })
  );
  const pending = current.session.apply(
    { kind: "remove", sectionId: "hero" },
    1,
    controller.signal
  );
  controller.abort();
  current.session.finish();
  release(original());
  await expect(pending).rejects.toThrow();
  expect(current.preview).toHaveBeenCalledOnce();
  expect(current.commit).toHaveBeenCalledOnce();
  expect(
    bodySections(current.data() as Content).map((item) => item.props.id)
  ).toEqual(["hero", "testimonials"]);
});

it("rejects resolution that loses generated content and retains earlier changes", async () => {
  const current = fixture();
  const signal = new AbortController().signal;
  await current.session.apply(
    { kind: "remove", sectionId: "services" },
    0,
    signal
  );
  current.adapter.resolve.mockImplementationOnce(async (data) => {
    bodySections(data as Content)[0].props.text = "Corrupted";
    return data;
  });
  await expect(
    current.session.apply(
      { kind: "remove", sectionId: "testimonials" },
      1,
      signal
    )
  ).rejects.toThrow();
  current.session.finish();
  expect(
    bodySections(current.data() as Content).map((item) => item.props.id)
  ).toEqual(["hero", "testimonials"]);
  expect(current.commit).toHaveBeenCalledOnce();
});

const event = (value: unknown) =>
  new TextEncoder().encode(`data: ${JSON.stringify(value)}\n\n`);
it("streams removal before request completion, includes full model context and does not replay steps", async () => {
  const current = fixture();
  let stream!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      stream = controller;
    },
  });
  const transport = vi.fn<GenerationEnvironment["transport"]>(async () => ({
    contentType: "text/event-stream",
    body,
  }));
  const environment: GenerationEnvironment = {
    model: "test",
    catalog: current.catalog,
    locales: ["en"],
    transport,
    diagnostics: { log: vi.fn(), report: vi.fn() },
  };
  const controller = new AbortController();
  const request: GenerationRequestExecutor = (
    payload,
    signal = controller.signal,
    onContent,
    onStep
  ) =>
    executeGeneration(
      payload,
      environment,
      signal,
      "test",
      onContent,
      onStep
    );
  const pending = runRegeneration({
    layoutId: "layout",
    currentData: original() as Content,
    messages: [{ role: "user", content: "Focus on the product" }],
    signal: controller.signal,
    active: () => !controller.signal.aborted,
    request,
    canvas: {
      beginRegeneration: () => {},
      applyRegeneration: (...args) => current.session.apply(...args),
      finishRegeneration: () => current.session.finish(),
    },
    onProgress: vi.fn(),
  });
  const wire = JSON.stringify(
    response([
      { kind: "remove", sectionId: "services" },
      {
        kind: "reorder",
        sectionId: "testimonials",
        anchor: { position: "start" },
      },
    ])
  );
  const boundary = wire.indexOf(',{"kind":"reorder"');
  stream.enqueue(
    event({
      type: "response.output_text.delta",
      delta: wire.slice(0, boundary),
    })
  );
  await vi.waitFor(() => expect(current.preview).toHaveBeenCalledOnce());
  expect(
    bodySections(current.data() as Content).map((item) => item.props.id)
  ).toEqual(["hero", "testimonials"]);
  stream.enqueue(
    event({ type: "response.output_text.delta", delta: wire.slice(boundary) })
  );
  stream.enqueue(
    event({
      type: "response.completed",
      response: { status: "completed", output_text: wire },
    })
  );
  stream.close();
  expect(await pending).toEqual({
    text: "Page regenerated.",
    clarification: false,
  });
  expect(current.preview).toHaveBeenCalledTimes(2);
  expect(current.commit).toHaveBeenCalledOnce();
  const sent = transport.mock.calls[0][0];
  const context = JSON.parse(sent.input.at(-1)!.content);
  expect(context.request).toBe("Focus on the product");
  expect(
    bodySections(context.context.layout).map((item) => item.props.id)
  ).toEqual(["hero", "services", "testimonials"]);
  expect(context.context.layout.content[0]).not.toHaveProperty("readOnly");
  expect(context.context.inventory.collections).toHaveLength(2);
  expect(sent.text.format.schema).toHaveProperty("properties");
});

it("repairs before application but never retries after streamed steps", async () => {
  const run = async (streamed: boolean) => {
    const controller = new AbortController();
    const request = vi
      .fn<GenerationRequestExecutor>()
      .mockImplementationOnce(async (_payload, _signal, _content, onStep) => {
        if (streamed)
          await onStep!({ kind: "remove", sectionId: "services" }, 0);
        throw new GenerationError("Invalid output", true);
      })
      .mockResolvedValueOnce({
        type: "regenerated",
        text: "Fixed",
        result: { action: "regenerate", steps: [] },
      });
    const finishRegeneration = vi.fn();
    const pending = runRegeneration({
      layoutId: "layout",
      currentData: original() as Content,
      messages: [{ role: "user", content: "Product page" }],
      signal: controller.signal,
      active: () => true,
      request,
      canvas: {
        beginRegeneration: vi.fn(),
        applyRegeneration: vi.fn(),
        finishRegeneration,
      },
      onProgress: vi.fn(),
    });
    if (streamed)
      await expect(pending).rejects.toMatchObject({ retryable: false });
    else expect(await pending).toEqual({ text: "Fixed", clarification: false });
    expect(request).toHaveBeenCalledTimes(streamed ? 1 : 2);
    expect(finishRegeneration).toHaveBeenCalledOnce();
  };
  await run(false);
  await run(true);
});

it("never applies incomplete steps and rejects a final response that rewrites streamed work", async () => {
  const compiled = compileRegenerationSchema(
    creationCatalog(),
    ["en"],
    original() as Content
  );
  const applied = vi.fn(async (_step: RegenerationStep, _index: number) => {});
  const stream = compiled.streamRegeneration(applied);
  const wire = JSON.stringify(
    response([
      { kind: "replace", sectionId: "hero", sections: [heading("Product")] },
    ])
  );
  const boundary = wire.indexOf('"Product"') + 4;
  await stream.write(wire.slice(0, boundary));
  expect(applied).not.toHaveBeenCalled();
  await stream.write(wire.slice(boundary));
  stream.finish();
  expect(applied).toHaveBeenCalledOnce();
  const accepted = compiled.parseResponse(wire);
  expect(accepted.result.steps[0]).toEqual(applied.mock.calls[0][0]);
  expect(() =>
    compiled.parseResponse(wire.replace("Product", "Changed"))
  ).toThrow("already streamed");
  expect(() =>
    compiled.parseResponse(
      JSON.stringify({
        translationMode: "defaultOnly",
        result: { action: "clarification", question: "More details?" },
        text: "",
      })
    )
  ).toThrow("Clarification cannot follow");
});

it("does not overwrite a different editor context when ending a partial session", async () => {
  const current = fixture();
  await current.session.apply(
    { kind: "remove", sectionId: "services" },
    0,
    new AbortController().signal
  );
  const otherPage: Data = { root: {}, content: [savedHeading("other")] };
  current.adapter.preview(otherPage);
  current.session.finish();
  expect(current.data()).toEqual(otherPage);
  expect(current.commit).not.toHaveBeenCalled();
});
