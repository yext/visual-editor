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
        generation: {
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
        generation: {
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

it.each([z.coerce.string(), z.coerce.number(), z.coerce.boolean()])(
  "rejects coercion before exporting the wire contract (%#)",
  (value) => {
    const catalog = createPuckGenerationCatalog({
      Section: { generation: { props: z.object({ value }) } },
    });
    expect(() => compileGenerationSchema(catalog, ["en"])).toThrow(
      /Section.value: coercion cannot be represented/
    );
  }
);

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
        generation: { props },
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
      generation: { props: z.object({ text }) },
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
