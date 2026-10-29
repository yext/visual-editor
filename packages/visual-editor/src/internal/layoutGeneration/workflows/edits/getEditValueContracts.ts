import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import type { GenerationComponent } from "../../../../utils/createPuckGenerationCatalog.ts";
import { unwrapZodSchema as unwrap } from "../../../utils/unwrapZodSchema.ts";
import type { createGenerationSchemaCompiler } from "../../schema/compiler.ts";
import { localizedTextSchema } from "../../shared/localizedText.ts";
import { generationFields } from "../../shared/slottedItemSource.ts";
import { hasSlots } from "./utils.ts";

// Nested unions still describe one correlated value (for example image or video).
const unionAlternatives = (schema: z.ZodType): z.ZodType[] => {
  const node = unwrap(schema);
  return node instanceof z.ZodUnion
    ? node.options.flatMap((option) => unionAlternatives(option as z.ZodType))
    : [schema];
};

type Compiler = ReturnType<typeof createGenerationSchemaCompiler>;
type EditValueContract = {
  /** A JSON pointer relative to authored props. */
  path: string;
  /** Component-authored guidance, including visibility relationships. */
  description?: string;
  /** A strict schema and decoder for explicit assignments. */
  set?: ReturnType<Compiler["value"]>;
  /** Whether an optional value can be removed. */
  unset: boolean;
};

/** Enumerate authored paths without exposing slot replacement or editor metadata. */
export const getEditValueContracts = (
  compiler: Compiler,
  config: GenerationComponent,
  readOnly: Record<string, boolean> = {},
  currentProps?: Record<string, unknown>
): EditValueContract[] => {
  if (!config.generation) {
    return [];
  }
  const contracts = new Map<string, EditValueContract>();
  const visit = (
    schema: z.ZodType,
    field: Fields[string] | undefined,
    path: string,
    current?: any
  ) => {
    if (field?.type === "slot") {
      return;
    }
    compiler.checks(schema, path);
    const node = unwrap(schema);
    // Keep structured fallbacks (such as localized images) in their saved
    // representation. Merging a direct asset beside defaultValue would leave
    // the old rendered fallback in place while falsely reporting success.
    if (node instanceof z.ZodUnion && current && typeof current === "object") {
      const fallback = unionAlternatives(node).find((option) => {
        const branch = unwrap(option as z.ZodType);
        return (
          branch instanceof z.ZodObject &&
          ["defaultValue", "image"].some(
            (key) =>
              Object.hasOwn(current, key) &&
              branch.shape[key] &&
              Object.keys(branch.shape).every(
                (name) => name === key || name === "hasLocalizedValue"
              ) &&
              unwrap(branch.shape[key]) instanceof z.ZodObject
          ) &&
          !localizedTextSchema(branch) &&
          branch.safeParse(current).success
        );
      });
      if (fallback) {
        let savedSchema = fallback as z.ZodType;
        if (schema.safeParse(undefined).success) {
          savedSchema = savedSchema.optional();
        }
        if (schema.safeParse(null).success) {
          savedSchema = savedSchema.nullable();
        }
        visit(savedSchema, field, path, current);
        return;
      }
    }
    // Object union branches can correlate siblings (for example, a custom
    // color requires a contrast and darkness flag). Expose the complete value
    // so the wire schema enforces those constraints before materialization.
    const objectUnion =
      node instanceof z.ZodUnion &&
      unionAlternatives(node).every(
        (option) => unwrap(option) instanceof z.ZodObject
      ) &&
      !hasSlots(field);
    if (node instanceof z.ZodUnion && !objectUnion) {
      for (const option of node.options) {
        visit(option as z.ZodType, field, path, current);
      }
    } else if (node instanceof z.ZodObject) {
      for (const [key, child] of Object.entries(
        compiler.shapeFor(node, path)
      )) {
        visit(
          child,
          field?.type === "object" ? field.objectFields[key] : undefined,
          `${path}/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`,
          current?.[key]
        );
      }
    }
    const existing = contracts.get(path);
    const unset = !hasSlots(field) && schema.safeParse(undefined).success;
    let set: EditValueContract["set"];
    if (
      (objectUnion || !(node instanceof z.ZodUnion)) &&
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
        description: schema.description ?? existing?.description,
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
        `/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`,
        currentProps?.[key]
      );
    }
  }
  return [...contracts.values()];
};
