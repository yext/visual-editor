// @vitest-environment node
import { expect, it, vi } from "vitest";
import { z } from "zod";
import { exportGenerationSchema } from "./strictGenerationSchema.ts";

vi.mock("zod", async (importOriginal) => {
  const actual = await importOriginal<typeof import("zod")>();
  return {
    ...actual,
    z: { ...actual.z, toJSONSchema: vi.fn(actual.z.toJSONSchema) },
  };
});

it("preserves inline enum constraints emitted beside reused references", () => {
  // Zod emits this shape when a section task edits shared CTA schemas.
  const exporter = vi.mocked(
    z.toJSONSchema as (schema: z.ZodType) => Record<string, unknown>
  );
  exporter.mockReturnValueOnce({
    type: "object",
    properties: {
      value: {
        type: "string",
        enum: ["primary", "secondary", "link"],
        $ref: "#/$defs/described",
      },
    },
    required: ["value"],
    additionalProperties: false,
    $defs: {
      described: {
        description: "The visual style of the CTA",
        $ref: "#/$defs/base",
      },
      base: { type: "string", enum: ["primary", "secondary", "link", "none"] },
    },
  });
  const result = exportGenerationSchema(z.strictObject({ value: z.string() }));
  expect(result.properties.value).toEqual({
    type: "string",
    enum: ["primary", "secondary", "link"],
    description: "The visual style of the CTA",
  });
  const accepts = (node: any, value: string): boolean => {
    if (node.$ref) {
      expect(Object.keys(node)).toEqual(["$ref"]);
      return accepts(result.$defs[node.$ref.split("/").at(-1)], value);
    }
    return (
      (!node.enum || node.enum.includes(value)) &&
      (!node.anyOf || node.anyOf.some((branch: any) => accepts(branch, value)))
    );
  };
  expect(accepts(result.properties.value, "primary")).toBe(true);
  expect(accepts(result.properties.value, "none")).toBe(false);
  expect(accepts(result.properties.value, "unknown")).toBe(false);
});

it("rejects cyclic enum references without recursing indefinitely", () => {
  vi.mocked(
    z.toJSONSchema as (schema: z.ZodType) => Record<string, unknown>
  ).mockReturnValueOnce({
    type: "object",
    properties: { value: { enum: ["primary"], $ref: "#/$defs/cycle" } },
    required: ["value"],
    additionalProperties: false,
    $defs: { cycle: { $ref: "#/$defs/cycle" } },
  });
  expect(() =>
    exportGenerationSchema(z.strictObject({ value: z.string() }))
  ).toThrow(/reference siblings are unsupported/);
});

it("rejects contradictory enum constraints instead of dropping either constraint", () => {
  vi.mocked(
    z.toJSONSchema as (schema: z.ZodType) => Record<string, unknown>
  ).mockReturnValueOnce({
    type: "object",
    properties: { value: { enum: ["primary"], $ref: "#/$defs/base" } },
    required: ["value"],
    additionalProperties: false,
    $defs: { base: { type: "string", enum: ["secondary"] } },
  });
  expect(() =>
    exportGenerationSchema(z.strictObject({ value: z.string() }))
  ).toThrow(/no common values/);
});
