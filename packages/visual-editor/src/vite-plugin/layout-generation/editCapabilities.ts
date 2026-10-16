import type { Fields } from "@puckeditor/core";
import { hasSlots } from "../../internal/generation/editUtils.ts";
import { z } from "zod";
import { unwrapZodSchema as unwrap } from "../../internal/utils/unwrapZodSchema.ts";
import { generationFields } from "../../internal/generation/slottedItemSource.ts";
import type { GenerationComponent } from "./puckGenerationCatalog.ts";
import type { createGenerationSchemaCompiler } from "./generationSchemaCompiler.ts";

type Compiler = ReturnType<typeof createGenerationSchemaCompiler>;
type EditValueContract = {
  /** A JSON pointer relative to authored props. */
  path: string;
  /** A strict schema and decoder for explicit assignments. */
  set?: ReturnType<Compiler["value"]>;
  /** Whether an optional value can be removed. */
  unset: boolean;
};

/** Enumerate authored paths without exposing slot replacement or editor metadata. */
export const getEditValueContracts = (
  compiler: Compiler,
  config: GenerationComponent,
  readOnly: Record<string, boolean> = {}
): EditValueContract[] => {
  if (!config.generation) {
    return [];
  }
  const contracts = new Map<string, EditValueContract>();
  const visit = (
    schema: z.ZodType,
    field: Fields[string] | undefined,
    path: string
  ) => {
    if (field?.type === "slot") {
      return;
    }
    compiler.checks(schema, path);
    const node = unwrap(schema);
    if (node instanceof z.ZodUnion) {
      for (const option of node.options) {
        visit(option as z.ZodType, field, path);
      }
    } else if (node instanceof z.ZodObject) {
      for (const [key, child] of Object.entries(
        compiler.shapeFor(node, path)
      )) {
        visit(
          child,
          field?.type === "object" ? field.objectFields[key] : undefined,
          `${path}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`
        );
      }
    }
    const existing = contracts.get(path);
    const unset = !hasSlots(field) && schema.safeParse(undefined).success;
    let set: EditValueContract["set"];
    if (
      !(node instanceof z.ZodUnion) &&
      !(node instanceof z.ZodObject) &&
      !hasSlots(field)
    ) {
      set = compiler.value(schema, path, field, undefined, false);
    } else if (schema.safeParse(null).success && !hasSlots(field)) {
      set = { wire: z.null(), apply: () => null };
    }
    if (set && existing?.set) {
      const alternatives = [existing.set, set];
      set = {
        wire: compiler.union(alternatives.map((item) => item.wire)),
        apply: (input) =>
          alternatives
            .find((item) => item.wire.safeParse(input).success)!
            .apply(input, undefined),
      };
    }
    if (set || unset || existing) {
      contracts.set(path, {
        path,
        set: set ?? existing?.set,
        unset: unset || !!existing?.unset,
      });
    }
  };
  const fields = generationFields(config);
  for (const [key, schema] of Object.entries(config.generation.props.shape)) {
    if (["id", "puck", "readOnly"].includes(key)) {
      throw new Error("Generation contract declares editor-owned metadata.");
    }
    if (!readOnly[key]) {
      visit(
        schema as z.ZodType,
        fields[key],
        `/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`
      );
    }
  }
  return [...contracts.values()];
};
