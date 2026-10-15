// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { compactGenerationSchema } from "./compactGenerationSchema.ts";

const expand = (schema: Record<string, any>) => {
  const visit = (node: any, active: Set<string>): any => {
    if (node.$ref) {
      if (active.has(node.$ref)) return { $ref: "recursive" };
      const name = node.$ref
        .slice("#/$defs/".length)
        .replaceAll("~1", "/")
        .replaceAll("~0", "~");
      const target = node.$ref === "#" ? schema : schema.$defs[name];
      expect(target).toBeDefined();
      return visit(target, new Set([...active, node.$ref]));
    }
    const result = { ...node };
    delete result.$defs;
    if (node.properties)
      result.properties = Object.fromEntries(
        Object.entries(node.properties).map(([key, child]) => [
          key,
          visit(child, active),
        ])
      );
    if (node.items) result.items = visit(node.items, active);
    if (node.anyOf) {
      const branches = node.anyOf
        .map((child: any) => visit(child, active))
        .flatMap((child: any) =>
          Object.keys(child).length === 1 && child.anyOf ? child.anyOf : [child]
        );
      result.anyOf = [
        ...new Map(
          branches.map((child: any) => [JSON.stringify(child), child])
        ).values(),
      ];
    }
    return result;
  };
  return visit(schema, new Set());
};

describe("compact generation schema", () => {
  it("shares repeated structures and preserves constraints and descriptions exactly", () => {
    const makeValue = () =>
      z.strictObject({
        color: z
          .string()
          .regex(/^#[a-f0-9]{6}$/)
          .describe("A six digit hex color"),
        size: z.number().min(1).max(100),
        label: z.string().min(1).nullable(),
      });
    const original = z.toJSONSchema(
      z.strictObject(
        Object.fromEntries(
          Array.from({ length: 12 }, (_, index) => [
            `field${index}`,
            z.array(makeValue()).min(1).max(3),
          ])
        )
      )
    );
    const snapshot = JSON.stringify(original);
    const compact = compactGenerationSchema(original);
    expect(JSON.stringify(original)).toBe(snapshot);
    expect(expand(compact)).toEqual(expand(original));
    expect(JSON.stringify(compact).length).toBeLessThan(snapshot.length * 0.5);
    const originalValidator = z.fromJSONSchema(original);
    const compactValidator = z.fromJSONSchema(compact);
    const valid = Object.fromEntries(
      Array.from({ length: 12 }, (_, index) => [
        `field${index}`,
        [{ color: "#abcdef", size: 2, label: null }],
      ])
    );
    for (const candidate of [
      valid,
      { ...valid, field0: [] },
      { ...valid, field0: [{ color: "blue", size: 2, label: "Name" }] },
      { ...valid, field0: [{ color: "#abcdef", size: 0, label: "Name" }] },
      { ...valid, field0: [{ color: "#abcdef", size: 2 }] },
      { ...valid, extra: true },
    ]) {
      expect(compactValidator.safeParse(candidate).success).toBe(
        originalValidator.safeParse(candidate).success
      );
    }
    expect(compactValidator.safeParse(valid).success).toBe(true);
  });

  it("flattens bare nested unions and duplicate branches while keeping annotations", () => {
    const original = {
      type: "object",
      properties: {
        value: {
          anyOf: [
            { anyOf: [{ type: "string", minLength: 1 }, { type: "null" }] },
            { type: "null" },
            {
              description: "Keep this description",
              anyOf: [{ type: "number", minimum: 1 }],
            },
          ],
        },
      },
      required: ["value"],
      additionalProperties: false,
    };
    const compact = compactGenerationSchema(original);
    expect(expand(compact)).toEqual(expand(original));
    expect(compact.properties.value.anyOf).toHaveLength(3);
    expect(JSON.stringify(compact)).toContain("Keep this description");
  });

  it("preserves recursive references and escaped definition names", () => {
    const original = {
      type: "object",
      properties: { root: { $ref: "#/$defs/a~1b~0c" } },
      required: ["root"],
      additionalProperties: false,
      $defs: {
        "a/b~c": {
          type: "object",
          properties: {
            children: { type: "array", items: { $ref: "#/$defs/a~1b~0c" } },
          },
          required: ["children"],
          additionalProperties: false,
        },
      },
    };
    const compact = compactGenerationSchema(original);
    expect(expand(compact)).toEqual(expand(original));
    expect(compact.properties.root.$ref).toBe("#/$defs/d0");
    const validator = z.fromJSONSchema(compact);
    expect(
      validator.safeParse({ root: { children: [{ children: [] }] } }).success
    ).toBe(true);
    expect(
      validator.safeParse({ root: { children: [{ children: "bad" }] } }).success
    ).toBe(false);
  });
});
