// @vitest-environment node
import { expect, it, vi } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { normalizeGeneratedText } from "../shared/localizedText.ts";
import { createGenerationSchemaCompiler } from "./compiler.ts";
import { compileGenerationSchema } from "../workflows/fullPageGeneration/pageSchema.ts";
import { exportGenerationSchema } from "./strictSchema.ts";

vi.mock("./strictSchema.ts", async (importOriginal) => {
  const original = await importOriginal<typeof import("./strictSchema.ts")>();
  return {
    ...original,
    exportGenerationSchema: vi.fn(original.exportGenerationSchema),
  };
});

it("exports a reachable component graph once with the same input and output schema", async () => {
  const catalog = createPuckGenerationCatalog(
    {
      Section: {
        layoutGenerationMetadata: {
          props: z.object({
            slots: z.object({ cards: z.array(z.unknown()).min(1).max(3) }),
          }),
        },
        fields: {
          slots: {
            type: "object",
            objectFields: { cards: { type: "slot", allow: ["Card"] } },
          },
        },
        defaultProps: { slots: { cards: [] } },
      },
      Card: {
        nestedOnly: true,
        layoutGenerationMetadata: {
          props: z.object({
            text: z
              .object({
                defaultValue: z.string(),
                hasLocalizedValue: z.string().optional(),
              })
              .catchall(z.string()),
            optional: z.string().optional(),
            nullable: z.string().nullable(),
            fallback: z.string().default("Fallback"),
            prefault: z.string().prefault("Prefault"),
            choices: z.union([z.literal("auto"), z.number().min(1).max(5)]),
            values: z.array(z.string().min(1)).max(3),
          }),
        },
        defaultProps: {
          text: { defaultValue: "Card" },
          nullable: null,
          choices: "auto",
          values: [],
        },
      },
    },
    { rootAllowedComponentIds: ["MainContent"] }
  );
  const exporter = vi.mocked(exportGenerationSchema);
  exporter.mockClear();
  const compiled = compileGenerationSchema(catalog, ["en", "es"]);
  expect(exporter).toHaveBeenCalledTimes(1);
  const [wire, metadata, io] = exporter.mock.calls[0];
  expect(io).toBe("output");
  const original =
    await vi.importActual<typeof import("./strictSchema.ts")>(
      "./strictSchema.ts"
    );
  expect(compiled.jsonSchema).toEqual(
    original.exportGenerationSchema(wire, metadata, "input")
  );
});

it.each([
  { name: "any", value: z.any(), message: "unsupported any schema" },
  {
    name: "open-ended records",
    value: z.record(z.string(), z.string()),
    message: "unsupported record schema",
  },
  {
    name: "transforms",
    value: z.string().transform((value) => value.length),
    message: "unsupported pipe schema",
  },
  {
    name: "refinements",
    value: z.string().refine((value) => !!value),
    message: "custom refinements cannot be represented by strict JSON Schema",
  },
  {
    name: "optional refinements",
    value: z
      .string()
      .refine((value) => !!value)
      .optional(),
    message: "custom refinements cannot be represented by strict JSON Schema",
  },
  ...[
    { name: "string coercion", value: z.coerce.string() },
    { name: "number coercion", value: z.coerce.number() },
    { name: "boolean coercion", value: z.coerce.boolean() },
  ].map((entry) => ({
    ...entry,
    message: "coercion cannot be represented by a strict wire schema",
  })),
])("rejects $name in authored contracts", ({ value, message }) => {
  const catalog = createPuckGenerationCatalog({
    Section: { layoutGenerationMetadata: { props: z.object({ value }) } },
  });

  const compiler = createGenerationSchemaCompiler(catalog, ["en"]);

  expect(() => compiler.element("Section")).toThrow(
    `Generation schema at Section.value: ${message}`
  );
});

it.each(["create", "insert"] as const)(
  "preserves newly authored rich text when switching away from localized defaults (%s)",
  (mode) => {
    const rich = z.strictObject({
      html: z.string().optional(),
      json: z.string().optional(),
    });
    const text = z.union([
      z.string(),
      z
        .object({
          defaultValue: z.union([z.string(), rich]).optional(),
          hasLocalizedValue: z.literal("true").optional(),
        })
        .catchall(z.union([z.string(), rich]).optional()),
      rich,
    ]);
    const props = z.object({ text });
    const old = { html: "<p>Banner Text</p>", json: "old document" };
    const authored = {
      html: "<p>Meet Pumpkin Spice</p>",
      json: "new document",
    };
    const catalog = createPuckGenerationCatalog({
      Banner: {
        layoutGenerationMetadata: { props },
        defaultProps: { text: { defaultValue: old } },
      },
    });
    const compiler = createGenerationSchemaCompiler(
      catalog,
      ["en", "es"],
      mode
    );
    const candidate = compiler
      .element("Banner")
      .apply({ type: "Banner", props: { text: authored } }, undefined);
    expect(candidate.props.text).toEqual(authored);
    expect(
      normalizeGeneratedText(candidate.props, props, undefined, false, [
        "en",
        "es",
      ]).text
    ).toEqual({ defaultValue: authored });
  }
);

it("drops direct-rich-text keys when authoring a localized bundle without retaining the old representation", () => {
  const rich = z.strictObject({
    html: z.string().optional(),
    json: z.string().optional(),
  });
  const text = z.union([
    z.string(),
    z
      .object({ defaultValue: z.union([z.string(), rich]).optional() })
      .catchall(z.union([z.string(), rich]).optional()),
    rich,
  ]);
  const catalog = createPuckGenerationCatalog({
    Banner: {
      layoutGenerationMetadata: { props: z.object({ text }) },
      defaultProps: { text: { html: "old", json: "old" } },
    },
  });
  const compiler = createGenerationSchemaCompiler(catalog, ["en"], "insert");
  const input = {
    type: "Banner",
    props: { text: { defaultValue: "New fallback", en: { $unset: true } } },
  };
  expect(compiler.element("Banner").apply(input, undefined).props.text).toEqual(
    { defaultValue: "New fallback" }
  );
});
