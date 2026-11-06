// @vitest-environment node
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  LOCATOR_ENTITY_TYPES,
  resolveCanonicalSelectorGroups,
  createPuckGenerationCatalog,
  createSlottedItemSource,
  entityFieldZodSchema,
  inferFieldZodSchema,
  isLocatorEntityType,
  toPuckFields,
  translatableStringZodSchema,
  widthZodSchema,
  type BasicSelectorField,
} from "../../sectionLibrarySupport.ts";
import { compileGenerationSchema } from "../../internal/layoutGeneration/workflows/fullPageGeneration/pageSchema.ts";
import { createGenerationSchemaCompiler } from "../../internal/layoutGeneration/schema/compiler.ts";

const linkSchema = entityFieldZodSchema(translatableStringZodSchema).extend({
  enabled: z.boolean(),
  normalizeLink: z.boolean(),
});
const mappings = {
  title: { field: "name", constantValueEnabled: false, constantValue: "" },
  showAddress: true,
  linkOverride: {
    enabled: true,
    normalizeLink: false,
    field: "slug",
    constantValue: "/custom",
    constantValueEnabled: true,
  },
};
const directoryFixture = (slotted = true) => {
  const source = createSlottedItemSource({
    label: "Cards",
    itemLabel: "Card",
    cardName: "Card",
    mappingFields: {
      title: { type: "entityField", filter: { types: ["type.string"] } },
      showAddress: {
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
        generation: { required: false },
      },
      linkOverride: {
        type: "custom",
        render: () => createElement("div"),
        generation: { schema: linkSchema.optional() },
      },
    },
  });
  if (source.field.type !== "entityField") {
    throw new Error("Expected the source helper to produce an entity field");
  }
  const field = {
    ...source.field,
    fixedRepeatedField: "dm_directoryChildren",
    disableConstantValueToggle: true,
  };
  const catalog = createPuckGenerationCatalog({
    Directory: {
      fields: toPuckFields({
        data: field,
        slots: { type: "object", objectFields: { CardSlot: { type: "slot" } } },
      }),
      defaultProps: {
        ...source.defaultWrapperProps,
        data: {
          field: "dm_directoryChildren",
          constantValueEnabled: false,
          mappings,
        },
      },
      layoutGenerationMetadata: slotted
        ? { slottedItemSource: source.generationMetadata }
        : undefined,
    },
    Card: {
      nestedOnly: true,
      fields: { text: { type: "text" } },
      defaultProps: { text: "Card" },
    },
  });
  return { catalog, field };
};
const data = () => ({
  field: "dm_directoryChildren",
  constantValueEnabled: false,
  mappings,
});

describe("native generation contracts through section-library-support", () => {
  it("exposes the supported Locator entity types as the enum source", () => {
    const schema = z.enum(LOCATOR_ENTITY_TYPES);
    for (const entityType of LOCATOR_ENTITY_TYPES) {
      expect(schema.safeParse(entityType).success).toBe(true);
      expect(isLocatorEntityType(entityType)).toBe(true);
    }
    expect(schema.safeParse("unsupported").success).toBe(false);
    expect(isLocatorEntityType("unsupported")).toBe(false);
  });

  it.each([false, true])(
    "honors fixed-source restrictions and declared mapping shapes with slotted ownership: %s",
    (slotted) => {
      const { catalog, field } = directoryFixture(slotted);
      const schema =
        catalog.data.components.Directory.generation!.props.shape.data;
      expect(schema.safeParse(data()).success).toBe(true);
      expect(
        schema.safeParse({ ...data(), field: "anotherSource" }).success
      ).toBe(false);
      expect(
        schema.safeParse({ ...data(), constantValueEnabled: true }).success
      ).toBe(false);
      expect(
        schema.safeParse({
          ...data(),
          mappings: { ...mappings, showAddress: "true" },
        }).success
      ).toBe(false);
      expect(
        schema.safeParse({
          ...data(),
          mappings: { ...mappings, linkOverride: { enabled: "yes" } },
        }).success
      ).toBe(false);
      expect(
        schema.safeParse({
          ...data(),
          mappings: {
            ...mappings,
            showAddress: undefined,
            linkOverride: undefined,
          },
        }).success
      ).toBe(true);
      expect(z.toJSONSchema(schema)).not.toHaveProperty(
        "properties.constantValue"
      );
      if (!slotted) {
        expect(
          inferFieldZodSchema(field, { defaultValue: data() }).safeParse(data())
            .success
        ).toBe(true);
      }
      expect(catalog.fieldOmissions).toEqual([]);
    }
  );

  it("keeps fixed field and disabled manual mode independent", () => {
    const { field } = directoryFixture(false);
    const fixed = inferFieldZodSchema(
      { ...field, disableConstantValueToggle: false },
      { defaultValue: data() }
    );
    expect(
      fixed.safeParse({
        ...data(),
        constantValueEnabled: true,
        constantValue: [],
      }).success
    ).toBe(true);
    expect(
      fixed.safeParse({ ...data(), field: "other", constantValue: [] }).success
    ).toBe(false);
    const linked = inferFieldZodSchema(
      { ...field, fixedRepeatedField: undefined },
      { defaultValue: data() }
    );
    expect(linked.safeParse({ ...data(), field: "other" }).success).toBe(true);
    expect(
      linked.safeParse({ ...data(), constantValueEnabled: true }).success
    ).toBe(false);
  });

  it("keeps explicit fixed-source schema optionality authoritative", () => {
    const { field } = directoryFixture(false);
    const override = z.object({ field: z.literal("custom") }).optional();
    const schema = inferFieldZodSchema(
      { ...field, generation: { required: true, schema: override } },
      { defaultValue: data() }
    );
    expect(schema.safeParse(undefined).success).toBe(true);
    expect(schema.safeParse({ field: "custom" }).success).toBe(true);
  });

  it("compiles fixed-source literals and custom mappings through generation", () => {
    const { catalog } = directoryFixture();
    const compiled = compileGenerationSchema(catalog, ["en"]);
    const wireData = data();
    const spec = compiled.materialize({
      text: "Created",
      translationMode: "defaultOnly",
      result: {
        action: "create",
        content: [
          {
            type: "Directory",
            props: { data: wireData, slots: { CardSlot: [] } },
          },
        ],
      },
    }).spec!;
    expect(spec.content[0].props.data).toMatchObject({
      field: "dm_directoryChildren",
      constantValueEnabled: false,
      mappings: {
        title: { ...mappings.title, constantValue: { defaultValue: "" } },
        showAddress: true,
        linkOverride: { enabled: true },
      },
    });
    const wire = createGenerationSchemaCompiler(catalog, ["en"]).element(
      "Directory"
    ).wire;
    expect(
      wire.safeParse({
        type: "Directory",
        props: { data: { ...data(), field: "wrong" }, slots: { CardSlot: [] } },
      }).success
    ).toBe(false);
  });

  it.each([5, 50])(
    "infers opt-in integer constraints with existing bounds 1–%s",
    (max) => {
      const field = {
        type: "number" as const,
        min: 1,
        max,
        generation: { integer: true, required: false },
      };
      const schema = inferFieldZodSchema(field, { defaultValue: 1 });
      for (const value of [undefined, 1, max])
        expect(schema.safeParse(value).success).toBe(true);
      for (const value of [0, 1.5, max + 1])
        expect(schema.safeParse(value).success).toBe(false);
      const catalog = createPuckGenerationCatalog({
        Count: { fields: { count: field }, defaultProps: { count: 1 } },
      });
      const json = compileGenerationSchema(catalog, []).jsonSchema;
      expect(JSON.stringify(json)).toContain('"integer"');
      expect(
        inferFieldZodSchema({ type: "number", step: 1 }).safeParse(1.5).success
      ).toBe(true);
      expect(
        inferFieldZodSchema({
          ...field,
          generation: { integer: true, schema: z.number().optional() },
        }).safeParse(1.5).success
      ).toBe(true);
    }
  );

  it("shares canonical options in mixed selector groups while preserving nullability", () => {
    const field: BasicSelectorField = {
      type: "basicSelector",
      generation: { required: true, nullable: true },
      optionGroups: [
        ...resolveCanonicalSelectorGroups("MAX_WIDTH").map((group) => ({
          ...group,
          title: "Widths",
          description: "Match the page grid.",
        })),
        { title: "Other", options: [{ label: "Custom", value: "custom" }] },
      ],
    };
    const schema = inferFieldZodSchema(field);
    const adapted = toPuckFields({ width: field });
    const catalog = createPuckGenerationCatalog({
      Header: { fields: adapted },
    });
    for (const value of [...widthZodSchema.options, "custom", null]) {
      expect(schema.safeParse(value).success).toBe(true);
      expect(
        catalog.data.components.Header.generation!.props.safeParse({
          width: value,
        }).success
      ).toBe(true);
    }
    expect(schema.safeParse("invented").success).toBe(false);
    expect(schema.safeParse(undefined).success).toBe(false);
    expect(
      inferFieldZodSchema({
        ...field,
        generation: {
          nullable: true,
          schema: z.literal("override").optional(),
        },
      }).safeParse(undefined).success
    ).toBe(true);
    const headings = inferFieldZodSchema({
      type: "basicSelector",
      optionGroups: resolveCanonicalSelectorGroups("HEADING_LEVEL"),
    });
    expect(headings.safeParse(2).success).toBe(true);
    expect(headings.safeParse("2").success).toBe(false);
    const colors = inferFieldZodSchema({
      type: "basicSelector",
      options: "SITE_COLOR",
    });
    expect(
      colors.safeParse({
        selectedColor: "[#FFBBC7]",
        contrastingColor: "black",
        isDarkColor: false,
      }).success
    ).toBe(true);
  });
});
