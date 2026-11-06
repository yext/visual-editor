// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { z } from "zod";
import {
  assetImageZodSchema,
  backgroundColorZodSchema,
  comprehensiveCtaZodSchema,
  createPuckGenerationCatalog,
  createSlottedItemSource,
  ctaSelectorZodSchema,
  enhancedCtaZodSchema,
  entityFieldZodSchema,
  hoursZodSchema,
  imageZodSchema,
  inferFieldZodSchema,
  richTextZodSchema,
  siteColorZodSchema,
  toPuckFields,
  translatableRichTextZodSchema,
  translatableStringZodSchema,
  widthZodSchema,
  type YextFieldDefinition,
} from "../../sectionLibrarySupport.ts";
import { compileGenerationSchema } from "../../internal/layoutGeneration/workflows/fullPageGeneration/pageSchema.ts";
import { compileFullPageUpdateSchema } from "../../internal/layoutGeneration/workflows/fullPageUpdate/pageSchema.ts";

const custom = (schema: z.ZodType): YextFieldDefinition => ({
  type: "custom",
  render: () => createElement("div"),
  generation: { schema },
});
const color = {
  selectedColor: "[#FFBBC7]",
  contrastingColor: "black",
  isDarkColor: false,
};

describe("section-library-support generation contracts", () => {
  it("exports canonical localized content, bindings, CTAs, colors and hours", () => {
    const image = {
      url: "image.jpg",
      width: 100,
      height: 50,
      alternateText: { defaultValue: "Photo", fr: "Image" },
    };
    expect(assetImageZodSchema.safeParse(image).success).toBe(true);
    expect(imageZodSchema.safeParse({ defaultValue: image }).success).toBe(
      true
    );
    expect(
      translatableStringZodSchema.safeParse({
        defaultValue: "Hello",
        fr: "Bonjour",
      }).success
    ).toBe(true);
    expect(richTextZodSchema.safeParse({ html: "<p>Hello</p>" }).success).toBe(
      true
    );
    expect(
      translatableRichTextZodSchema.safeParse({
        defaultValue: { html: "<p>Hello</p>" },
        fr: { html: "<p>Bonjour</p>" },
      }).success
    ).toBe(true);
    expect(richTextZodSchema.safeParse({ json: "{}" }).success).toBe(false);
    const cta = { label: "Visit", link: "/visit" };
    expect(enhancedCtaZodSchema.safeParse(cta).success).toBe(true);
    expect(
      ctaSelectorZodSchema.safeParse({ field: "c_cta", constantValue: cta })
        .success
    ).toBe(true);
    expect(
      comprehensiveCtaZodSchema.safeParse({
        data: {
          actionType: "link",
          cta: { field: "", constantValueEnabled: true, constantValue: cta },
          openInNewTab: false,
        },
        styles: { variant: "primary" },
      }).success
    ).toBe(true);
    expect(
      entityFieldZodSchema(translatableStringZodSchema.optional()).safeParse({
        field: "name",
        constantValueEnabled: false,
      }).success
    ).toBe(true);
    for (const schema of [backgroundColorZodSchema, siteColorZodSchema]) {
      expect(schema.safeParse(color).success).toBe(true);
      expect(
        schema.safeParse({ ...color, selectedColor: "#FFBBC7" }).success
      ).toBe(false);
    }
    expect(
      hoursZodSchema.safeParse({
        monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
        holidayHours: [{ date: "2026-12-25", isClosed: true }],
      }).success
    ).toBe(true);
    expect(
      hoursZodSchema.safeParse({ monday: { isClosed: "yes" } }).success
    ).toBe(false);
    expect(
      inferFieldZodSchema({
        type: "entityField",
        filter: { types: ["type.hours"] },
        generation: { required: true },
      }).safeParse({
        field: "hours",
        constantValueEnabled: true,
        constantValue: { monday: { isClosed: false } },
      }).success
    ).toBe(true);
  });

  it("reuses nested backing fields for custom result-card and header link editors without invoking UI callbacks", () => {
    const render = vi.fn(() => createElement("div"));
    const factory = vi.fn(() => ({ label: "Link" }));
    const field: YextFieldDefinition = {
      type: "object",
      generation: { required: true },
      objectFields: {
        title: { type: "translatableString", generation: { required: true } },
        links: {
          type: "array",
          defaultItemProps: factory,
          generation: { required: true },
          arrayFields: {
            label: {
              type: "translatableString",
              generation: { required: true },
            },
            url: { type: "text", generation: { required: true } },
          },
        },
        width: {
          type: "basicSelector",
          options: "MAX_WIDTH",
          generation: { nullable: true },
        },
        color: { type: "themeColor", options: "SITE_COLOR" },
      },
    };
    const schema = inferFieldZodSchema(field);
    const fields = toPuckFields({
      result: { type: "custom", render, generation: { schema } },
    });
    const catalog = createPuckGenerationCatalog({ Result: { fields } });
    expect(
      z.toJSONSchema(
        catalog.data.components.Result.generation!.props.shape.result
      )
    ).toEqual(z.toJSONSchema(schema));
    expect(
      schema.safeParse({
        title: "Result",
        links: [{ label: "Visit", url: "/" }],
        width: null,
        color,
      }).success
    ).toBe(true);
    expect(
      schema.safeParse({ title: "Result", links: [{ label: "Visit" }] }).success
    ).toBe(false);
    expect(render).not.toHaveBeenCalled();
    expect(factory).not.toHaveBeenCalled();
  });

  it("preserves discriminated custom payloads and replacement schema optionality", () => {
    const payload = z
      .discriminatedUnion("type", [
        z.object({
          type: z.literal("text"),
          text: inferFieldZodSchema({
            type: "translatableString",
            generation: { required: true },
          }),
        }),
        z.object({ type: z.literal("image"), image: imageZodSchema }),
      ])
      .optional();
    const field = custom(payload);
    field.generation = { schema: payload, required: true, nullable: true };
    const schema = inferFieldZodSchema(field, {
      defaultValue: { type: "text", text: "Default" },
    });
    expect(schema.safeParse(undefined).success).toBe(true);
    expect(schema.safeParse(null).success).toBe(false);
    expect(schema.safeParse({ type: "text", text: "Hello" }).success).toBe(
      true
    );
    expect(
      schema.safeParse({ type: "image", text: "Wrong payload" }).success
    ).toBe(false);
    const adjust = vi.fn((inferred: z.ZodType) => inferred.optional());
    expect(
      inferFieldZodSchema(
        { type: "text", generation: { schema: adjust } },
        { defaultValue: "Default" }
      ).safeParse(undefined).success
    ).toBe(true);
    expect(adjust.mock.calls[0][0].safeParse(undefined).success).toBe(false);
  });

  it("keeps canonical width values stable and makes null inheritance opt-in", () => {
    const strict = inferFieldZodSchema({
      type: "basicSelector",
      options: "MAX_WIDTH",
      generation: { required: true },
    });
    const nullable = inferFieldZodSchema({
      type: "basicSelector",
      options: "MAX_WIDTH",
      generation: { nullable: true, required: true },
    });
    for (const value of ["theme", "fullWidth", "default", "768px", "1440px"]) {
      expect(widthZodSchema.safeParse(value).success).toBe(true);
      expect(strict.safeParse(value).success).toBe(true);
      expect(nullable.safeParse(value).success).toBe(true);
    }
    expect(strict.safeParse(null).success).toBe(false);
    expect(nullable.safeParse(null).success).toBe(true);
    expect(nullable.safeParse(undefined).success).toBe(false);
    expect(strict.safeParse("invented").success).toBe(false);
    expect(
      inferFieldZodSchema({
        type: "select",
        options: [{ label: "A", value: "a" }],
        generation: { nullable: true },
      }).safeParse(null).success
    ).toBe(true);
    expect(
      inferFieldZodSchema({
        type: "radio",
        options: [{ label: "A", value: "a" }],
      }).safeParse(null).success
    ).toBe(false);
  });

  it("keeps shared guidance through optionality and deduplicates field instructions", () => {
    const base = inferFieldZodSchema({
      type: "themeColor",
      options: "SITE_COLOR",
    });
    const schema = inferFieldZodSchema({
      type: "themeColor",
      options: "SITE_COLOR",
      generation: {
        instructions: `${base.description}\nUse only for this heading.\nUse only for this heading.`,
      },
    });
    expect(schema.description).toBe(
      `${base.description}\nUse only for this heading.`
    );
    expect(
      inferFieldZodSchema({ type: "translatableString" }).description
    ).toContain("locale");
    expect(
      inferFieldZodSchema({
        type: "entityField",
        filter: { types: ["type.string"] },
      }).description
    ).toContain("Preserve existing bindings");
    const source = createSlottedItemSource({
      label: "Cards",
      itemLabel: "Card",
      cardName: "Card",
      mappingFields: {
        title: { type: "entityField", filter: { types: ["type.string"] } },
      },
    });
    const catalog = createPuckGenerationCatalog({
      Section: {
        fields: toPuckFields({
          data: source.field,
          slots: {
            type: "object",
            objectFields: { CardSlot: { type: "slot" } },
          },
        }),
        defaultProps: source.defaultWrapperProps,
        layoutGenerationMetadata: {
          slottedItemSource: source.generationMetadata,
        },
      },
      Card: { fields: { title: { type: "text" } } },
    });
    const data = catalog.data.components.Section.generation!.props.shape.data;
    expect(data.description).toContain("Manual cards:");
    expect(data.description).toContain("Linked cards:");
  });

  it("rejects unsupported backing fields without executing dynamic options", () => {
    const options = vi.fn(() => [{ label: "A", value: "a" }]);
    expect(() =>
      inferFieldZodSchema({ type: "basicSelector", options })
    ).toThrow(/No static schema/);
    expect(options).not.toHaveBeenCalled();
    expect(() =>
      inferFieldZodSchema({ type: "text", generation: { exclude: true } })
    ).toThrow(/excluded/);
    expect(() =>
      inferFieldZodSchema({
        type: "object",
        objectFields: {
          unknown: { type: "custom", render: () => createElement("div") },
        },
      })
    ).toThrow(/unknown/);
  });

  it("compiles public backing-field contracts for creation and full-page updates", () => {
    const schema = inferFieldZodSchema({
      type: "object",
      generation: { required: true },
      objectFields: {
        title: { type: "translatableString", generation: { required: true } },
        width: {
          type: "basicSelector",
          options: "MAX_WIDTH",
          generation: { nullable: true, required: true },
        },
      },
    });
    const catalog = createPuckGenerationCatalog({
      Section: { fields: toPuckFields({ content: custom(schema) }) },
    });
    const section = {
      type: "Section",
      props: { content: { title: "Hello", width: null } },
    };
    const page = compileGenerationSchema(catalog, ["en"]).materialize({
      text: "Created",
      translationMode: "defaultOnly",
      result: { action: "create", content: [section] },
    }).spec!;
    expect(page.content[0].props.content.width).toBeNull();
    const result = compileFullPageUpdateSchema(
      catalog,
      ["en"],
      page
    ).parseResponse(
      JSON.stringify({
        text: "Updated",
        translationMode: "defaultOnly",
        result: {
          action: "fullPageUpdate",
          steps: [
            {
              kind: "replace",
              sectionId: page.content[0].props.id,
              sections: [
                {
                  ...section,
                  props: { content: { title: "Updated", width: "fullWidth" } },
                },
              ],
            },
          ],
        },
      })
    );
    expect(result.result.steps[0].sections[0].props.content).toEqual({
      title: { defaultValue: "Updated" },
      width: "fullWidth",
    });
  });
});
