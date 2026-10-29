import { expect, it, vi } from "vitest";
import type { Data } from "@puckeditor/core";
import type { Content } from "../../shared/authoredValues.ts";
import { creationCatalog, heading } from "../../testing/creationFixtures.ts";
import { slottedFixture } from "../../testing/slottedFixtures.ts";
import { applyRegenerationStep } from "./applyRegenerationStep.ts";
import type { RegenerationStep } from "./contracts.ts";
import { compileRegenerationSchema } from "./pageSchema.ts";
import {
  regenerationLayout,
  regenerationResponse,
  bodySections,
} from "../../testing/regenerationFixtures.ts";

it.each([false, true])(
  "identifies an updating section before streaming its body, reversed header: %s",
  async (reversed) => {
    const compiled = compileRegenerationSchema(
      creationCatalog(),
      ["en"],
      regenerationLayout()
    );
    const onSection = vi.fn(async (_sectionId: string) => {});
    const onStep = vi.fn(async (_step: RegenerationStep) => {});
    const stream = compiled.streamRegeneration(onStep, onSection);
    const header = reversed
      ? { sectionId: "hero", kind: "replace" }
      : { kind: "replace", sectionId: "hero" };
    const wire = JSON.stringify(
      regenerationResponse([{ ...header, sections: [heading("Updated")] }])
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
    const compiled = compileRegenerationSchema(
      creationCatalog(),
      ["en"],
      regenerationLayout()
    );
    const onSection = vi.fn(async (_sectionId: string) => {});
    const stream = compiled.streamRegeneration(async () => {}, onSection);
    await stream.write(
      JSON.stringify(
        regenerationResponse([
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
  const baseline = regenerationLayout() as Content;
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
    regenerationResponse([
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
        regenerationResponse(
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
      regenerationResponse([
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

it("never applies incomplete steps and rejects a final response that rewrites streamed work", async () => {
  const compiled = compileRegenerationSchema(
    creationCatalog(),
    ["en"],
    regenerationLayout() as Content
  );
  const applied = vi.fn(async (_step: RegenerationStep, _index: number) => {});
  const stream = compiled.streamRegeneration(applied);
  const wire = JSON.stringify(
    regenerationResponse([
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
