// @vitest-environment node
import { expect, it, vi } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../utils/generationCatalog.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import { exportGenerationSchema } from "./strictGenerationSchema.ts";

vi.mock("./strictGenerationSchema.ts", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./strictGenerationSchema.ts")>();
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
  const original = await vi.importActual<
    typeof import("./strictGenerationSchema.ts")
  >("./strictGenerationSchema.ts");
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
