import { z } from "zod";
import { expect, it, vi } from "vitest";
import type { Data } from "@puckeditor/core";
import type { Content } from "../../shared/authoredValues.ts";
import { creationCatalog, heading } from "../../testing/creationFixtures.ts";
import { slottedFixture } from "../../testing/slottedFixtures.ts";
import { applyFullPageUpdateStep } from "./applyFullPageUpdateStep.ts";
import type { FullPageUpdateStep } from "./contracts.ts";
import { compileFullPageUpdateSchema } from "./pageSchema.ts";
import {
  fullPageUpdateLayout,
  fullPageUpdateResponse,
  bodySections,
} from "../../testing/fullPageUpdateFixtures.ts";

it.each([false, true])(
  "identifies an updating section before streaming its body, reversed header: %s",
  async (reversed) => {
    const compiled = compileFullPageUpdateSchema(
      creationCatalog(),
      ["en"],
      fullPageUpdateLayout()
    );
    const onSection = vi.fn(async (_sectionId: string) => {});
    const onStep = vi.fn(async (_step: FullPageUpdateStep) => {});
    const stream = compiled.streamFullPageUpdate(onStep, onSection);
    const header = reversed
      ? { sectionId: "hero", kind: "replace" }
      : { kind: "replace", sectionId: "hero" };
    const wire = JSON.stringify(
      fullPageUpdateResponse([{ ...header, sections: [heading("Updated")] }])
    );
    const boundary = wire.indexOf(',"sections":');
    await stream.write(wire.slice(0, boundary));
    expect(onSection).toHaveBeenCalledExactlyOnceWith("hero");
    expect(onStep).not.toHaveBeenCalled();
    await stream.write(wire.slice(boundary));
    stream.finish();
    expect(onSection).toHaveBeenCalledOnce();
    expect(onStep).toHaveBeenCalledOnce();
  }
);

it.each(["keep", "remove", "reorder"])(
  "does not focus a %s decision",
  async (kind) => {
    const compiled = compileFullPageUpdateSchema(
      creationCatalog(),
      ["en"],
      fullPageUpdateLayout()
    );
    const onSection = vi.fn(async (_sectionId: string) => {});
    const stream = compiled.streamFullPageUpdate(async () => {}, onSection);
    await stream.write(
      JSON.stringify(
        fullPageUpdateResponse([
          {
            kind,
            sectionId: "hero",
            ...(kind === "reorder" ? { anchor: { position: "end" } } : {}),
          },
        ])
      )
    );
    stream.finish();
    expect(onSection).not.toHaveBeenCalled();
  }
);

it("compiles full-page context and generates stable replacement identities with preserved remainder", () => {
  const catalog = creationCatalog();
  const baseline = fullPageUpdateLayout() as Content;
  const compiled = compileFullPageUpdateSchema(catalog, ["en", "fr"], baseline);
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
    fullPageUpdateResponse([
      { kind: "replace", sectionId: "hero", sections: [heading("Product")] },
    ])
  );
  const parsed = compiled.parseResponse(wire);
  expect(compiled.parseResponse(wire)).toEqual(parsed);
  const step = parsed.result.steps[0] as FullPageUpdateStep;
  const next = applyFullPageUpdateStep(catalog, baseline, step);
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

it.each(["defaultOnly", "translate"])(
  "materializes nested slots, card sources and %s text",
  (translationMode) => {
    const slotted = slottedFixture();
    const baseline = slotted.materialize();
    const compiled = compileFullPageUpdateSchema(
      slotted.catalog,
      ["en", "fr"],
      baseline
    );
    const result = compiled.parseResponse(
      JSON.stringify(
        fullPageUpdateResponse(
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
    const next = applyFullPageUpdateStep(
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
  const compiled = compileFullPageUpdateSchema(
    slotted.catalog,
    ["en"],
    baseline
  );
  const result = compiled.parseResponse(
    JSON.stringify(
      fullPageUpdateResponse([
        {
          kind: "replace",
          sectionId: baseline.content[0].props.id,
          sections: [slotted.section([], slotted.linked)],
        },
      ])
    )
  );
  const next = applyFullPageUpdateStep(
    slotted.catalog,
    baseline,
    result.result.steps[0]
  );
  expect(next.content[0].props.data.field).toBe("c_items");
  expect(next.content[0].props.data.mappings.question.field).toBe("name");
});

it("updates a page containing editor-linked cards while preserving their identities and backup", async () => {
  const fixture = slottedFixture();
  const manual = fixture.materialize();
  Object.assign(manual.content[0].props.data, {
    field: "c_items",
    constantValueEnabled: false,
  });
  const baseline = await fixture.resolve(manual, {
    locale: "en",
    c_items: [{ name: "Linked item" }],
  });
  const compiled = compileFullPageUpdateSchema(
    fixture.catalog,
    ["en"],
    baseline
  );
  const result = compiled.parseResponse(
    JSON.stringify(
      fullPageUpdateResponse([
        { kind: "keep", sectionId: baseline.content[0].props.id },
        {
          kind: "insert",
          collection: { ownerId: null, slotPath: null },
          anchor: { position: "end" },
          sections: [fixture.section([])],
        },
      ])
    )
  );
  const next = applyFullPageUpdateStep(
    fixture.catalog,
    baseline,
    result.result.steps[1]
  );
  expect(next.content).toHaveLength(2);
  expect(next.content[0]).toEqual(baseline.content[0]);
});

it("never applies incomplete steps and rejects a final response that rewrites streamed work", async () => {
  const compiled = compileFullPageUpdateSchema(
    creationCatalog(),
    ["en"],
    fullPageUpdateLayout() as Content
  );
  const applied = vi.fn(
    async (_step: FullPageUpdateStep, _index: number) => {}
  );
  const stream = compiled.streamFullPageUpdate(applied);
  const wire = JSON.stringify(
    fullPageUpdateResponse([
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

it.each(["replace", "insert"] as const)(
  "streams and parses a %s into MainContent with restricted page roots",
  async (kind) => {
    const catalog = creationCatalog();
    catalog.puckOptions.rootAllowedComponentIds = ["MainContent"];
    const baseline = fullPageUpdateLayout();
    baseline.content = baseline.content.filter(
      (item) => item.type === "MainContent"
    );
    const compiled = compileFullPageUpdateSchema(catalog, ["en"], baseline);
    const wire = JSON.stringify(
      fullPageUpdateResponse([
        {
          kind,
          ...(kind === "replace"
            ? { sectionId: "hero" }
            : {
                collection: { ownerId: "main", slotPath: "/content" },
                anchor: { position: "start" },
              }),
          sections: [heading("Updated")],
        },
      ])
    );
    let streamed = baseline;
    const onStep = vi.fn(async (step: FullPageUpdateStep) => {
      streamed = applyFullPageUpdateStep(catalog, streamed, step);
    });
    const stream = compiled.streamFullPageUpdate(onStep);
    await stream.write(wire);
    stream.finish();
    expect(onStep).toHaveBeenCalledOnce();
    const step = compiled.parseResponse(wire).result.steps[0];
    expect(step).toEqual(onStep.mock.calls[0][0]);
    expect(applyFullPageUpdateStep(catalog, baseline, step)).toEqual(streamed);
    expect(bodySections(streamed)[0].props.text).toBe("Updated");
    expect(streamed.content[0].type).toBe("MainContent");

    // Preparing a section fragment must not relax actual page-root permissions.
    expect(() =>
      applyFullPageUpdateStep(catalog, baseline, {
        kind: "insert",
        collection: { ownerId: null, slotPath: null },
        anchor: { position: "end" },
        sections: step.sections,
      })
    ).toThrow("Component type is not permitted in this section collection.");
  }
);

it("limits model removal targets to exact existing section Ids while tolerating missing removals at runtime", async () => {
  const catalog = creationCatalog();
  const baseline = fullPageUpdateLayout();
  const compiled = compileFullPageUpdateSchema(catalog, ["en"], baseline);
  const wireSchema = z.fromJSONSchema(compiled.jsonSchema);
  const response = (sectionId: string) =>
    fullPageUpdateResponse([{ kind: "remove", sectionId }]);
  expect(wireSchema.safeParse(response("hero")).success).toBe(true);
  expect(wireSchema.safeParse(response("missing")).success).toBe(false);
  expect(wireSchema.safeParse(response("main")).success).toBe(false);
  let current = baseline;
  const onStep = vi.fn(async (step: FullPageUpdateStep) => {
    current = applyFullPageUpdateStep(catalog, current, step);
  });
  const stream = compiled.streamFullPageUpdate(onStep);
  const wire = JSON.stringify(
    fullPageUpdateResponse([
      { kind: "remove", sectionId: "missing" },
      { kind: "remove", sectionId: "services" },
      { kind: "keep", sectionId: "hero" },
    ])
  );
  await stream.write(wire);
  stream.finish();
  expect(onStep).toHaveBeenCalledTimes(3);
  expect(compiled.parseResponse(wire).result.steps).toEqual(
    onStep.mock.calls.map(([step]) => step)
  );
  expect(bodySections(current).map((item) => item.props.id)).toEqual([
    "hero",
    "testimonials",
  ]);
  const unstreamed = compileFullPageUpdateSchema(catalog, ["en"], baseline);
  expect(
    unstreamed.parseResponse(JSON.stringify(response("missing"))).result.steps
  ).toEqual([{ kind: "remove", sectionId: "missing" }]);
});

it("excludes nested card Ids from model removal targets", () => {
  const f = slottedFixture();
  const baseline = f.materialize();
  const compiled = compileFullPageUpdateSchema(f.catalog, ["en"], baseline);
  const schema = z.fromJSONSchema(compiled.jsonSchema);
  const response = (sectionId: string) =>
    fullPageUpdateResponse([{ kind: "remove", sectionId }]);
  expect(schema.safeParse(response(baseline.content[0].props.id)).success).toBe(
    true
  );
  expect(
    schema.safeParse(
      response(baseline.content[0].props.slots.CardSlot[0].props.id)
    ).success
  ).toBe(false);
  expect(() =>
    applyFullPageUpdateStep(f.catalog, baseline, {
      kind: "remove",
      sectionId: baseline.content[0].props.slots.CardSlot[0].props.id,
    })
  ).toThrow("Full-page update must target an existing section");
});

it("offers no removal operation when the page has no sections", () => {
  const compiled = compileFullPageUpdateSchema(creationCatalog(), ["en"], {
    content: [],
  });
  const schema = z.fromJSONSchema(compiled.jsonSchema);
  expect(schema.safeParse(fullPageUpdateResponse([])).success).toBe(true);
  expect(
    schema.safeParse(
      fullPageUpdateResponse([{ kind: "remove", sectionId: "missing" }])
    ).success
  ).toBe(false);
});

it.each([
  {
    kind: "insert",
    type: "Header",
    ownerId: null,
    sectionId: "header",
    expected: true,
  },
  {
    kind: "insert",
    type: "Heading",
    ownerId: "main",
    sectionId: "hero",
    expected: true,
  },
  {
    kind: "insert",
    type: "Header",
    ownerId: "main",
    sectionId: "hero",
    expected: false,
  },
  {
    kind: "insert",
    type: "Heading",
    ownerId: null,
    sectionId: "header",
    expected: false,
  },
  {
    kind: "insert",
    type: "Heading",
    ownerId: "missing",
    sectionId: "hero",
    expected: false,
  },
  {
    kind: "insert",
    type: "MainContent",
    ownerId: "main",
    sectionId: "hero",
    expected: false,
  },
  {
    kind: "replace",
    type: "Header",
    ownerId: null,
    sectionId: "header",
    expected: true,
  },
  {
    kind: "replace",
    type: "Heading",
    ownerId: "main",
    sectionId: "hero",
    expected: true,
  },
  {
    kind: "replace",
    type: "Header",
    ownerId: "main",
    sectionId: "hero",
    expected: false,
  },
  {
    kind: "replace",
    type: "Heading",
    ownerId: null,
    sectionId: "header",
    expected: false,
  },
])(
  "when $kind places $type in collection $ownerId then model validity is $expected",
  ({ kind, type, ownerId, sectionId, expected }) => {
    const catalog = creationCatalog();
    catalog.data.components.Header = { ...catalog.data.components.Heading };
    catalog.puckOptions.rootAllowedComponentIds = ["Header", "MainContent"];
    const baseline = fullPageUpdateLayout();
    baseline.content[0].type = "Header";
    baseline.content[2].type = "Header";
    const compiled = compileFullPageUpdateSchema(catalog, ["en"], baseline);
    const response = fullPageUpdateResponse([
      {
        kind,
        ...(kind === "insert"
          ? {
              collection: {
                ownerId,
                slotPath: ownerId === null ? null : "/content",
              },
              anchor: { position: "end" },
            }
          : { sectionId }),
        sections: [
          {
            type,
            props:
              type === "MainContent"
                ? { content: [] }
                : { text: "New section" },
          },
        ],
      },
    ]);
    expect(
      z.fromJSONSchema(compiled.jsonSchema).safeParse(response).success
    ).toBe(expected);
  }
);

it("when a collection permits no section types then the model cannot insert into it", () => {
  const catalog = creationCatalog();
  catalog.puckOptions.rootAllowedComponentIds = ["MainContent"];
  const baseline = fullPageUpdateLayout();
  baseline.content = baseline.content.filter(
    (item) => item.type === "MainContent"
  );
  const compiled = compileFullPageUpdateSchema(catalog, ["en"], baseline);
  const schema = z.fromJSONSchema(compiled.jsonSchema);
  expect(
    schema.safeParse(
      fullPageUpdateResponse([
        {
          kind: "insert",
          collection: { ownerId: null, slotPath: null },
          anchor: { position: "end" },
          sections: [heading("New section")],
        },
      ])
    ).success
  ).toBe(false);
  expect(
    schema.safeParse(
      fullPageUpdateResponse([
        {
          kind: "insert",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" },
          sections: [heading("New section")],
        },
      ])
    ).success
  ).toBe(true);
});
