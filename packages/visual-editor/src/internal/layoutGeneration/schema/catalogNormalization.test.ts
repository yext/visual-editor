// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { toPuckFields, type YextFields } from "../../../fields/fields.ts";
import { createGenerationSchemaCompiler } from "./compiler.ts";
import { slottedFixture } from "../testing/slottedFixtures.ts";

describe("catalog normalization", () => {
  it.each([
    "missing card",
    "references",
    "backup",
    "slot restriction",
    "missing slot",
    "fixed card collection",
  ])("rejects invalid metadata at catalog construction: %s", (change) => {
    const f = slottedFixture();

    const config = f.components.Section;

    if (change === "missing card") {
      config.layoutGenerationMetadata.slottedItemSource = {
        cardType: "Missing",
      };
    }
    if (change === "references") {
      config.layoutGenerationMetadata.props =
        config.layoutGenerationMetadata.props.extend({
          data: config.layoutGenerationMetadata.props.shape.data.extend({
            constantValue: z.array(z.unknown()),
          }),
        });
    }
    if (change === "backup") {
      config.layoutGenerationMetadata.props =
        config.layoutGenerationMetadata.props.extend({
          manualSlots: z.object({}),
        });
    }
    if (change === "slot restriction") {
      config.fields.slots.objectFields.CardSlot.disallow = ["FAQCard"];
    }
    if (change === "missing slot") {
      delete config.fields.slots.objectFields.CardSlot;
    }
    if (change === "fixed card collection") {
      config.fields.slots.objectFields.CardSlot.generation = {
        singleChild: true,
      };
    }
    expect(() => f.catalog).toThrow(/slottedItemSource/);
  });
});

it("normalizes adapted fields and card restrictions without changing the editor config", () => {
  const fixture = slottedFixture();

  const originalFields = fixture.components.Section.fields;

  const fields: YextFields = {
    ...originalFields,
    title: {
      type: "translatableString",
      generation: { required: true, instructions: "Write a short title" },
    },
  };

  const adapted = toPuckFields(fields);

  const catalog = createPuckGenerationCatalog({
    ...fixture.components,
    Section: { ...fixture.components.Section, fields: adapted },
  });

  const normalized = catalog.data.components.Section.fields;

  expect(normalized.title.type).toBe("translatableString");
  expect(normalized.title.generation?.instructions).toBe("Write a short title");
  expect(normalized.slots).toMatchObject({
    objectFields: { CardSlot: { allow: ["FAQCard"] } },
  });
  expect(originalFields.slots.objectFields.CardSlot.allow).toEqual([]);
  expect(adapted.title.type).toBe("custom");
  expect(normalized).not.toBe(adapted);

  originalFields.slots.objectFields.CardSlot.disallow = ["FAQCard"];

  for (const locales of [["en"], ["en", "fr"]]) {
    const compiler = createGenerationSchemaCompiler(catalog, locales);

    expect(() =>
      compiler.exportSchema(
        z.strictObject({ component: compiler.element("Section").wire })
      )
    ).not.toThrow();
    expect(catalog.data.components.Section.fields).toBe(normalized);
  }
});

it("keeps JSON Render's adapter linked to the canonical generation schema", () => {
  const catalog = createPuckGenerationCatalog({
    Heading: { fields: { text: { type: "text" } } },
    Opaque: { layoutGenerationMetadata: { exclude: true } },
  });

  const component = catalog.data.components.Heading;

  const replacement = z.object({ text: z.string().min(5) });

  component.generation = { props: replacement };

  expect(component.props).toBe(component.generation.props);
  expect(component.props.safeParse({ text: "tiny" }).success).toBe(false);
  expect(
    catalog.validate({
      content: [{ type: "Heading", props: { text: "Hello" } }],
    }).success
  ).toBe(true);
  expect(catalog.data.components.Opaque.generation).toBeUndefined();
});
