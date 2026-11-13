// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import type { Fields } from "@puckeditor/core";
import { toPuckFields, type YextFields } from "../../../fields/fields.ts";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { createSlottedItemSource } from "../../../utils/itemSource/createSlottedItemSource.ts";
import { ThemeOptions } from "../../../utils/themeOptions.ts";
import { DirectoryGrid } from "../../../components/sections/directory/DirectoryWrapper.tsx";
import { applyAuthoredValueEdits } from "../workflows/edits/applyEditsToComponent.ts";
import { getEditValueContracts } from "../workflows/edits/getEditValueContracts.ts";
import { compileFullPageUpdateSchema } from "../workflows/fullPageUpdate/pageSchema.ts";
import { compileGenerationSchema } from "../workflows/fullPageGeneration/pageSchema.ts";
import { validateAuthored, extractAuthored } from "../shared/authoredValues.ts";
import { createGenerationSchemaCompiler } from "./compiler.ts";

const catalogFor = (
  fields: YextFields,
  defaultProps: Record<string, unknown> = {}
) =>
  createPuckGenerationCatalog(
    { Section: { fields: fields as Fields, defaultProps } },
    { rootAllowedComponentIds: ["Section"] }
  );

describe("field inference", () => {
  it("infers nested static fields, value-typed options, bounds and array item defaults", () => {
    const catalog = catalogFor(
      {
        title: { type: "text" },
        visible: { type: "radio", options: ThemeOptions.SHOW_HIDE },
        rating: { type: "number", min: 1, max: 5, step: 0.5 },
        format: {
          type: "select",
          options: [
            { label: "One", value: 1 },
            { label: "None", value: null },
          ],
        },
        tags: { type: "checkbox", options: [{ label: "A", value: "a" }] },
        styles: {
          type: "object",
          objectFields: { align: { type: "text", visible: false } },
        },
        cards: {
          type: "array",
          min: 1,
          max: 2,
          defaultItemProps: { title: "Card" },
          arrayFields: { title: { type: "text" } },
        },
      },
      { title: "Default", visible: true, rating: 3, cards: [] }
    );

    const props = catalog.data.components.Section.generation!.props;

    const value = {
      title: "Hello",
      visible: false,
      rating: 2.5,
      cards: [{ title: "Card" }],
      format: null,
    };

    expect(props.safeParse(value).success).toBe(true);
    for (const patch of [
      { title: undefined },
      { visible: "false" },
      { rating: 6 },
      { cards: [{}] },
      { cards: [] },
      { tags: ["b"] },
      { format: "1" },
    ]) {
      expect(
        props.safeParse({ ...value, ...patch }).success,
        JSON.stringify(patch)
      ).toBe(false);
    }
  });

  it("lets explicit schemas own optionality and callbacks adjust inferred requiredness", () => {
    const seen = vi.fn((schema: z.ZodType) => schema.optional());

    const catalog = catalogFor(
      {
        inferred: {
          type: "text",
          generation: { required: false, instructions: "Optional heading" },
        },
        forced: { type: "text", generation: { required: true } },
        explicit: {
          type: "text",
          generation: { required: true, schema: z.string().optional() },
        },
        custom: {
          type: "custom",
          render: () => createElement("div"),
          generation: { schema: z.string() },
        },
        adjusted: { type: "text", generation: { schema: seen } },
      },
      { inferred: "Default", explicit: "Default", adjusted: "Default" }
    );

    const shape = catalog.data.components.Section.generation!.props.shape;

    expect(shape.inferred.safeParse(undefined).success).toBe(true);
    expect(shape.inferred.description).toContain("Optional heading");
    expect(shape.forced.safeParse(undefined).success).toBe(false);
    expect(shape.explicit.safeParse(undefined).success).toBe(true);
    expect(shape.custom.safeParse(undefined).success).toBe(false);
    expect(shape.adjusted.safeParse(undefined).success).toBe(true);
    expect(seen).toHaveBeenCalledOnce();
    expect(seen.mock.calls[0][0].safeParse(undefined).success).toBe(false);
  });

  it("omits unknown and explicitly excluded fields without executing renderers or option callbacks", () => {
    const callback = vi.fn(() => []);

    const render = vi.fn(() => createElement("div"));

    const catalog = catalogFor(
      {
        title: { type: "text" },
        custom: { type: "custom", render },
        dynamic: { type: "basicSelector", options: callback },
        excluded: { type: "text", generation: { exclude: true } },
        group: {
          type: "object",
          objectFields: { unknown: { type: "custom", render } },
        },
      },
      {
        title: "Default",
        custom: { private: true },
        excluded: "Keep",
        group: { unknown: "Keep" },
      }
    );

    expect(
      Object.keys(catalog.data.components.Section.generation!.props.shape)
    ).toEqual(["title", "group"]);
    expect(catalog.fieldOmissions.map(({ path }) => path)).toEqual([
      "props.custom",
      "props.dynamic",
      "props.group.unknown",
    ]);
    expect(callback).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();

    const compiled = compileGenerationSchema(catalog, ["en"]);

    const spec = compiled.materialize({
      text: "Created",
      translationMode: "defaultOnly",
      result: {
        action: "create",
        content: [{ type: "Section", props: { title: "New", group: {} } }],
      },
    }).spec!;

    expect(spec.content[0].props).toMatchObject({
      title: "New",
      custom: { private: true },
      excluded: "Keep",
      group: { unknown: "Keep" },
    });

    const config = catalog.data.components.Section;

    applyAuthoredValueEdits(spec.content[0], config, [
      { kind: "set", path: "/title", value: "Edited" },
    ]);
    expect(spec.content[0].props.custom).toEqual({ private: true });
    expect(() =>
      applyAuthoredValueEdits(spec.content[0], config, [
        { kind: "set", path: "/custom", value: "Overwrite" },
      ])
    ).toThrow();
    expect(extractAuthored(catalog, spec).content[0].props).not.toHaveProperty(
      "custom"
    );
  });

  it("makes components opt out and keeps complete component overrides authoritative", () => {
    const props = z.object({ title: z.string().min(4) });

    const metadata = { props };

    const catalog = createPuckGenerationCatalog(
      {
        Automatic: { fields: { title: { type: "text" } } },
        Form: {
          layoutGenerationMetadata: { exclude: true },
          fields: { title: { type: "text" } },
        },
        Explicit: {
          layoutGenerationMetadata: metadata,
          fields: { count: { type: "number" } },
        },
        Guided: {
          description: "A section",
          layoutGenerationMetadata: { instructions: "Use once" },
        },
      },
      { rootAllowedComponentIds: ["Automatic", "Form", "Explicit", "Guided"] }
    );

    expect(catalog.data.components.Form.generation).toBeUndefined();
    expect(catalog.data.components.Explicit.generation).toBe(metadata);
    expect(catalog.data.components.Guided.description).toContain("Use once");
    expect(
      compileGenerationSchema(catalog, []).availableComponentNames
    ).toEqual(["Automatic", "Explicit", "Guided"]);
  });

  it("reads original and adapted Yext fields, including nested override metadata", () => {
    const fields: YextFields = {
      nested: {
        type: "object",
        objectFields: {
          title: {
            type: "translatableString",
            generation: { required: true, instructions: "Write a title" },
          },
        },
      },
    };

    const original = catalogFor(fields);

    const adapted = catalogFor(toPuckFields(fields));

    expect(
      z.toJSONSchema(original.data.components.Section.generation!.props)
    ).toEqual(
      z.toJSONSchema(adapted.data.components.Section.generation!.props)
    );
    expect(adapted.fieldOmissions).toEqual([]);
  });

  it("passes field schema overrides through strict compilation", () => {
    const catalog = catalogFor({
      title: {
        type: "text",
        generation: {
          schema: z.string().transform((value) => value.toUpperCase()),
        },
      },
    });

    expect(() => compileGenerationSchema(catalog, [])).toThrow(
      /unsupported|transform/
    );
  });
});

it("keeps inferred rich text explicit during intent generation while allowing style defaults", () => {
  const catalog = catalogFor(
    {
      text: { type: "richtext" },
      width: { type: "number" },
    },
    { text: "<p>Placeholder</p>", width: 10 }
  );

  const compiled = compileFullPageUpdateSchema(catalog, [], {
    content: [
      {
        type: "Section",
        props: { id: "section", text: "Existing", width: 10 },
      },
    ],
  });

  const response = (text: unknown) =>
    JSON.stringify({
      text: "Updated",
      translationMode: "defaultOnly",
      result: {
        action: "fullPageUpdate",
        steps: [
          {
            kind: "replace",
            sectionId: "section",
            sections: [
              { type: "Section", props: { text, width: { $default: true } } },
            ],
          },
        ],
      },
    });

  expect(() => compiled.parseResponse(response({ $default: true }))).toThrow();

  const updated = compiled.parseResponse(
    response("<p>Intent-specific copy</p>")
  );

  expect(updated.result.steps[0]).toMatchObject({
    kind: "replace",
    sections: [{ props: { text: "<p>Intent-specific copy</p>", width: 10 } }],
  });
});

it("compiles structured Yext field contracts without resolving render values", () => {
  const fields: YextFields = {
    cta: { type: "ctaSelector" },
    comprehensive: { type: "comprehensiveCTA" },
    image: { type: "image" },
    video: { type: "video" },
    text: { type: "styledText", includeColor: true },
    button: { type: "styledButton" },
    link: { type: "styledLink" },
    section: { type: "styledPageSection" },
    imageStyle: { type: "styledImage" },
    imageStyleWithRatio: { type: "styledImage", includeAspectRatio: true },
    font: { type: "fontSizeSelector", includeLargeSizes: false },
    size: {
      type: "optionalNumber",
      defaultCustomValue: 20,
      hideNumberFieldRadioLabel: "Hide",
      showNumberFieldRadioLabel: "Show",
    },
    palette: { type: "basicSelector", options: "SITE_COLOR" },
    multi: {
      type: "multiSelector",
      label: "Values",
      dropdownLabel: "Value",
      options: [
        { label: "Yes", value: true },
        { label: "Two", value: 2 },
      ],
    },
  };

  const catalog = catalogFor(fields);

  expect(catalog.fieldOmissions).toEqual([]);

  const shape = catalog.data.components.Section.generation!.props.shape;

  expect(shape.imageStyle.parse({ borderRadius: "default" })).toEqual({
    borderRadius: "default",
  });
  expect(z.toJSONSchema(shape.imageStyle)).not.toHaveProperty(
    "properties.aspectRatio"
  );
  expect(shape.imageStyleWithRatio.parse({ borderRadius: "8px" })).toEqual({
    borderRadius: "8px",
  });
  for (const aspectRatio of ["default", 1, 1.78, 0.25]) {
    const value = { borderRadius: "8px", aspectRatio };
    expect(shape.imageStyleWithRatio.parse(value)).toEqual(value);
  }
  for (const aspectRatio of ["1.78", 0, -1, 1.234]) {
    expect(
      shape.imageStyleWithRatio.safeParse({ borderRadius: "8px", aspectRatio })
        .success
    ).toBe(false);
  }
  expect(shape.font.safeParse("9xl").success).toBe(false);
  expect(shape.size.safeParse("__ve_optionalNumber_hide__").success).toBe(true);
  expect(
    shape.multi.safeParse({ selections: [{ value: true }, { value: 2 }] })
      .success
  ).toBe(true);
  expect(
    shape.multi.safeParse({ selections: [{ value: "true" }] }).success
  ).toBe(false);
  expect(
    shape.link.safeParse({
      fontFamily: "default",
      fontSize: "default",
      fontWeight: "default",
      fontStyle: "default",
      textTransform: "default",
      letterSpacing: "default",
      includeCaret: "block",
    }).success
  ).toBe(true);
  expect(() => compileGenerationSchema(catalog, ["en", "fr"])).not.toThrow();
});

describe("standard-library-shaped contracts", () => {
  it.each([false, true])(
    "requires resolver-compatible entity constants for adapted fields: %s",
    (adapted) => {
      const fields: YextFields = {
        text: { type: "entityField", filter: { types: ["type.string"] } },
      };
      const catalog = catalogFor(adapted ? toPuckFields(fields) : fields);
      const schema = catalog.data.components.Section.generation!.props;
      const node = createGenerationSchemaCompiler(catalog, ["en"]).element(
        "Section"
      );
      const binding = { field: "name", constantValueEnabled: false };

      expect(schema.parse({ text: binding })).toEqual({ text: binding });
      expect(schema.parse({ text: { field: "name" } })).toEqual({
        text: { field: "name" },
      });
      expect(
        schema.safeParse({
          text: { ...binding, constantValueEnabled: true },
        }).success
      ).toBe(false);
      const existing = {
        type: "Section",
        props: { id: "existing", text: binding },
      };
      expect(() =>
        validateAuthored(catalog, { content: [existing] })
      ).not.toThrow();
      expect(
        node.wire.safeParse({ type: "Section", props: { text: binding } })
          .success
      ).toBe(false);
      expect(
        node.wire.safeParse({
          type: "Section",
          props: { text: { ...binding, constantValue: { $unset: true } } },
        }).success
      ).toBe(false);

      const props = { text: { ...binding, constantValue: "" } };
      expect(schema.parse(props)).toEqual(props);
      const generated = node.apply(
        node.wire.parse({ type: "Section", props }),
        undefined
      );
      const saved = JSON.parse(JSON.stringify(generated));
      const document = { name: "Yext" };
      expect(saved.props.text).toEqual(props.text);
      expect(resolveYextEntityField(document, saved.props.text, "en")).toBe(
        "Yext"
      );
      const resolved = resolveComponentData(saved.props.text, "en", document);
      expect(renderToStaticMarkup(createElement("h3", null, resolved))).toBe(
        "<h3>Yext</h3>"
      );
    }
  );

  it("accepts DirectoryGrid's existing cardTitle mapping without a constant", () => {
    const catalog = createPuckGenerationCatalog({ DirectoryGrid });
    const component = {
      type: "DirectoryGrid",
      props: { ...DirectoryGrid.defaultProps, id: "directory" },
    };
    expect(component.props.data?.mappings?.cardTitle).toEqual({
      field: "name",
      constantValueEnabled: false,
    });
    expect(() =>
      validateAuthored(catalog, { content: [component] })
    ).not.toThrow();
    expect(
      extractAuthored(catalog, { content: [component] }).content[0].props.data
        .mappings.cardTitle
    ).toEqual(component.props.data?.mappings?.cardTitle);
  });

  it("preserves editor-authored image-list wrappers through generation", () => {
    const catalog = catalogFor({
      photos: {
        type: "entityField",
        filter: { types: ["type.image"], includeListsOnly: true },
      },
    });
    const image = { url: "photo.jpg", width: 100, height: 100 };
    const props = {
      photos: {
        field: "",
        constantValueEnabled: true,
        constantValue: [{ assetImage: image }],
      },
    };

    expect(
      catalog.data.components.Section.generation!.props.parse(props)
    ).toEqual(props);

    const compiler = createGenerationSchemaCompiler(catalog, ["en"]);
    const node = compiler.element("Section");
    const wireValue = {
      type: "Section",
      props: {
        photos: {
          ...props.photos,
          constantValue: [
            { assetImage: { ...image, alternateText: { $unset: true } } },
          ],
        },
      },
    };

    expect(node.apply(node.wire.parse(wireValue), undefined).props).toEqual(
      props
    );
    expect(() => compileGenerationSchema(catalog, ["en"])).not.toThrow();
  });

  it.each(["type.string", "custom.unknown"])(
    "restricts non-repeated linked-only fields without inferring %s constants",
    (type) => {
      const catalog = catalogFor({
        text: {
          type: "entityField",
          filter: { types: [type] } as any,
          disableConstantValueToggle: true,
        },
      });
      const props = { text: { field: "name", constantValueEnabled: false } };
      const schema = catalog.data.components.Section.generation!.props;

      expect(schema.parse(props)).toEqual(props);
      expect(
        schema.safeParse({
          text: { ...props.text, constantValueEnabled: true },
        }).success
      ).toBe(false);
      expect(catalog.fieldOmissions).toEqual([]);

      const compiler = createGenerationSchemaCompiler(catalog, ["en"]);
      const node = compiler.element("Section");
      const wireValue = { type: "Section", props };

      expect(node.apply(node.wire.parse(wireValue), undefined).props).toEqual(
        props
      );
      expect(
        node.wire.safeParse({
          ...wireValue,
          props: { text: { ...props.text, constantValueEnabled: true } },
        }).success
      ).toBe(false);
      expect(() => compileGenerationSchema(catalog, ["en"])).not.toThrow();
    }
  );

  it("supports email lists with explicit optional style overrides and integer constraints", () => {
    const catalog = catalogFor(
      {
        data: {
          type: "object",
          objectFields: {
            list: {
              type: "entityField",
              filter: { types: ["type.string"], includeListsOnly: true },
              disallowTranslation: true,
            },
          },
        },
        styles: {
          type: "object",
          generation: { required: false },
          objectFields: {
            listLength: {
              type: "number",
              min: 1,
              max: 5,
              visible: false,
              generation: { schema: z.number().int().min(1).max(5).optional() },
            },
            showIcon: {
              type: "radio",
              options: ThemeOptions.SHOW_HIDE,
              generation: { required: false },
            },
          },
        },
      },
      {
        data: { list: { field: "emails", constantValue: [] } },
        styles: { listLength: 3, showIcon: true },
      }
    );

    const props = catalog.data.components.Section.generation!.props;

    expect(
      props.safeParse({
        data: {
          list: { field: "emails", constantValue: ["hello@example.com"] },
        },
      }).success
    ).toBe(true);
    expect(
      props.safeParse({
        data: {
          list: { field: "emails", constantValue: { defaultValue: "Email" } },
        },
      }).success
    ).toBe(false);

    const compiler = createGenerationSchemaCompiler(catalog, ["en"]);

    const contracts = getEditValueContracts(
      compiler,
      catalog.data.components.Section
    );

    expect(
      contracts.find(({ path }) => path === "/styles/showIcon")?.unset
    ).toBe(true);
    expect(
      contracts
        .find(({ path }) => path === "/styles/listLength")
        ?.set?.wire.safeParse(1.5).success
    ).toBe(false);
    expect(() => compileGenerationSchema(catalog, ["en"])).not.toThrow();
  });

  it("compiles localized text, rich text, images, colors and entity bindings for generation and edits", () => {
    const catalog = catalogFor(
      {
        text: { type: "entityField", filter: { types: ["type.rich_text_v2"] } },
        image: { type: "entityField", filter: { types: ["type.image"] } },
        background: { type: "themeColor", options: "BACKGROUND_COLOR" },
      },
      {
        text: { field: "description", constantValue: "Default" },
        image: { field: "photo", constantValue: undefined },
      }
    );

    const compiler = createGenerationSchemaCompiler(catalog, ["en", "fr"]);

    const value = {
      type: "Section",
      props: {
        text: {
          field: "description",
          constantValue: {
            defaultValue: { html: "<p>Offer</p>" },
            fr: { html: "<p>Offre</p>" },
          },
          constantValueEnabled: true,
        },
        image: {
          field: "photo",
          constantValue: {
            url: "photo.jpg",
            width: 100,
            height: 100,
            alternateText: { defaultValue: "Photo", fr: "Image" },
          },
          constantValueEnabled: false,
        },
        background: {
          selectedColor: "[#FFBBC7]",
          contrastingColor: "black",
          isDarkColor: false,
        },
      },
    };

    const node = compiler.element("Section");

    const unset = { $unset: true };

    const wireValue = {
      ...value,
      props: {
        ...value.props,
        text: {
          ...value.props.text,
          constantValue: {
            defaultValue: {
              ...value.props.text.constantValue.defaultValue,
              json: unset,
            },
            fr: { ...value.props.text.constantValue.fr, json: unset },
            en: unset,
            hasLocalizedValue: unset,
          },
        },
        image: {
          ...value.props.image,
          constantValue: {
            ...value.props.image.constantValue,
            alternateText: {
              ...value.props.image.constantValue.alternateText,
              en: unset,
              hasLocalizedValue: unset,
            },
          },
        },
      },
    };

    node.wire.parse(wireValue);

    const component = node.apply(wireValue, undefined);

    component.props.id = "section";
    validateAuthored(catalog, { content: [component] });

    const contracts = getEditValueContracts(
      compiler,
      catalog.data.components.Section,
      {},
      component.props
    );

    expect(contracts.some(({ path }) => path === "/background")).toBe(true);
    expect(
      catalog.data.components.Section.generation!.props.safeParse({
        ...value.props,
        background: { ...value.props.background, selectedColor: "#FFBBC7" },
      }).success
    ).toBe(false);
    expect(() => compileGenerationSchema(catalog, ["en", "fr"])).not.toThrow();
  });

  it("keeps discriminated custom-field unions and fixed slot cardinality", () => {
    const content = z.discriminatedUnion("type", [
      z.object({
        type: z.literal("emails"),
        emails: z.object({ address: z.string() }),
      }),
      z.object({
        type: z.literal("phone"),
        phone: z.object({ number: z.string() }),
      }),
    ]);

    const catalog = createPuckGenerationCatalog(
      {
        Section: {
          fields: {
            content: {
              type: "custom",
              render: () => createElement("div"),
              generation: { schema: content },
            },
            child: {
              type: "slot",
              allow: ["Heading"],
              generation: { singleChild: true },
            },
          },
        },
        Heading: {
          nestedOnly: true,
          fields: { text: { type: "text", generation: { required: true } } },
        },
      },
      { rootAllowedComponentIds: ["Section"] }
    );

    const compiler = createGenerationSchemaCompiler(catalog, []);

    const valid = {
      type: "Section",
      props: {
        content: { type: "emails", emails: { address: "a@b.com" } },
        child: [{ type: "Heading", props: { text: "Contact" } }],
      },
    };

    const wire = compiler.element("Section").wire;

    expect(wire.safeParse(valid).success).toBe(true);
    expect(
      wire.safeParse({ ...valid, props: { ...valid.props, child: [] } }).success
    ).toBe(false);
    expect(
      wire.safeParse({
        ...valid,
        props: {
          ...valid.props,
          content: { type: "emails", phone: { number: "123" } },
        },
      }).success
    ).toBe(false);
    expect(() => compileGenerationSchema(catalog, [])).not.toThrow();
  });

  it("infers slotted sources without exposing references or manual backups", () => {
    const source = createSlottedItemSource({
      label: "Cards",
      itemLabel: "Card",
      cardName: "Card",
      mappingFields: {
        title: { type: "entityField", filter: { types: ["type.string"] } },
      },
    });

    const catalog = createPuckGenerationCatalog(
      {
        Section: {
          fields: {
            data: source.field as Fields[string],
            slots: {
              type: "object",
              visible: false,
              objectFields: { CardSlot: { type: "slot" } },
            },
          },
          defaultProps: source.defaultWrapperProps,
          layoutGenerationMetadata: {
            slottedItemSource: source.generationMetadata,
          },
        },
        Card: {
          nestedOnly: true,
          fields: { title: { type: "text", generation: { required: true } } },
          defaultProps: { title: "Default" },
        },
      },
      { rootAllowedComponentIds: ["Section"] }
    );

    const compiled = compileGenerationSchema(catalog, ["en"]);

    const spec = compiled.materialize({
      text: "Created",
      translationMode: "defaultOnly",
      result: {
        action: "create",
        content: [
          {
            type: "Section",
            props: {
              data: {
                field: "",
                constantValueEnabled: true,
                mappings: { $unset: true },
              },
              slots: {
                CardSlot: [{ type: "Card", props: { title: "Manual card" } }],
              },
            },
          },
        ],
      },
    }).spec!;

    expect(spec.content[0].props.slots.CardSlot[0].props.title).toBe(
      "Manual card"
    );
    expect(spec.content[0].props.manualSlots.CardSlot).toEqual(
      spec.content[0].props.slots.CardSlot
    );

    const schema = JSON.stringify(compiled.jsonSchema);

    expect(schema).not.toContain('"manualSlots"');
    expect(
      catalog.data.components.Section.generation!.props.shape.data.safeParse({
        field: "events",
        constantValueEnabled: false,
        mappings: { title: { field: "name", constantValueEnabled: true } },
      }).success
    ).toBe(false);
    const wire = createGenerationSchemaCompiler(catalog, []).element(
      "Section"
    ).wire;

    for (const cards of [
      [],
      [{ type: "Card", props: { title: "One" } }],
      [
        { type: "Card", props: { title: "One" } },
        { type: "Card", props: { title: "Two" } },
      ],
    ]) {
      expect(
        wire.safeParse({
          type: "Section",
          props: {
            data: {
              field: "",
              constantValueEnabled: true,
              mappings: { $unset: true },
            },
            slots: { CardSlot: cards },
          },
        }).success
      ).toBe(true);
    }
    const data = catalog.data.components.Section.generation!.props.shape.data;

    expect(
      data.safeParse({
        field: "events",
        constantValueEnabled: false,
        mappings: { title: { field: "name", constantValueEnabled: false } },
      }).success
    ).toBe(true);
    for (const constantValue of [
      "Static title",
      { defaultValue: "Static title" },
      undefined,
    ]) {
      expect(
        data.safeParse({
          field: "events",
          constantValueEnabled: false,
          mappings: {
            title: {
              field: "name",
              constantValueEnabled: false,
              constantValue,
            },
          },
        }).success
      ).toBe(false);
    }
    validateAuthored(catalog, spec);
  });
});
