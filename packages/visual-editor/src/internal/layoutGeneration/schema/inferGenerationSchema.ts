import { z } from "zod";
import { resolveCanonicalSelectorGroups } from "../../../utils/selectorOptions.ts";
import {
  appendSchemaInstructions,
  widthZodSchema,
} from "../../../utils/layoutGenerationSchemas/inferFieldZodSchema.ts";
import { slottedItemSourceSchema } from "./slottedItemSourceSchema.ts";
import type { Fields } from "@puckeditor/core";
import type {
  FieldGenerationMetadata,
  LayoutGenerationMetadata,
} from "../../../types/layoutGeneration.ts";
import {
  fontSizeOptions,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import {
  backgroundColorZodSchema,
  siteColorZodSchema,
} from "../../../utils/layoutGenerationSchemas/colorFieldSchemas.ts";
import {
  entityFieldZodSchema,
  imageZodSchema,
  translatableStringZodSchema,
  comprehensiveCtaZodSchema,
  ctaSelectorZodSchema,
  entityConstantZodSchemas,
  styledButtonZodSchema,
  styledImageZodSchema,
  styledLinkZodSchema,
  styledPageSectionZodSchema,
  styledTextZodSchema,
  videoZodSchema,
} from "../../../utils/layoutGenerationSchemas/yextFieldSchemas.ts";

// A catalog accepts both original Yext fields and Puck-adapted fields. Retain
// extension properties here rather than inspecting custom React renderers.
type InferenceField = {
  type: string;
  generation?: FieldGenerationMetadata;
  [key: string]: any;
};
type FieldMap = Record<string, InferenceField>;
export type FieldOmission = {
  component: string;
  path: string;
  fieldType: string;
  reason: string;
};

const union = (schemas: z.ZodType[]): z.ZodType | undefined =>
  schemas.length === 1
    ? schemas[0]
    : schemas.length
      ? z.union(schemas)
      : undefined;

/** Option values may be booleans, numbers or structured values, not just strings. */
const literalSchema = (value: unknown): z.ZodType | undefined => {
  if (value === null) {
    return z.null();
  }
  if (["string", "boolean", "number"].includes(typeof value)) {
    return z.literal(value as string | boolean | number);
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value).map(
      ([key, child]) => [key, literalSchema(child)] as const
    );

    if (entries.every(([, schema]) => schema)) {
      return z.object(Object.fromEntries(entries) as z.ZodRawShape);
    }
  }
  return undefined;
};

const optionSchema = (options: unknown): z.ZodType | undefined => {
  if (!Array.isArray(options)) {
    return undefined;
  }

  const values = options.filter((option) => option.value !== undefined);

  const schemas = values.map((option) => literalSchema(option.value));

  return schemas.every((schema) => schema)
    ? union(schemas as z.ZodType[])
    : undefined;
};

const record = (value: unknown): Record<string, any> =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

// Saved linked mappings may omit their unused constant. Generation must still
// supply it so the resulting binding can be recognized by entity resolvers.
const entityGenerationSchemas = z.registry<{ key: object }>();
const requiredEntitySchemas = new WeakMap<object, z.ZodType>();
export const getEntityGenerationSchema = (
  schema: z.ZodType
): z.ZodType | undefined => {
  const key = entityGenerationSchemas.get(schema)?.key;
  return key ? requiredEntitySchemas.get(key) : undefined;
};

/** Build authored contracts once, before the existing strict-wire compiler. */
export const inferGenerationSchema = (
  component: string,
  fields: Fields | undefined,
  defaults: Record<string, unknown> | undefined,
  metadata: LayoutGenerationMetadata | undefined,
  omissions: FieldOmission[]
): z.ZodObject => {
  const omit = (field: InferenceField, path: string, reason: string) => {
    omissions.push({ component, path, fieldType: field.type, reason });
    return undefined;
  };

  const object = (
    definitions: FieldMap,
    baseline: unknown,
    path: string
  ): z.ZodObject => {
    const shape: z.ZodRawShape = {};

    for (const [key, field] of Object.entries(definitions)) {
      // Never infer editor-owned values, even if exposed as hidden UI fields.
      if (["id", "puck", "readOnly"].includes(key) && path === "props") {
        continue;
      }

      const child = infer(field, record(baseline)[key], `${path}.${key}`);

      if (child) {
        Object.defineProperty(shape, key, {
          value: child,
          enumerable: true,
          configurable: true,
          writable: true,
        });
      }
    }
    return z.object(shape);
  };

  const entity = (
    field: InferenceField,
    baseline: unknown,
    path: string
  ): z.ZodType | undefined => {
    if (field.repeated) {
      const mappings = object(
        field.repeated.mappingFields,
        record(baseline).mappings,
        `${path}.mappings`
      );

      if (metadata?.slottedItemSource && path === "props.data") {
        return slottedItemSourceSchema(mappings, {
          fixedField: field.fixedRepeatedField || undefined,
          linkedOnly: !!field.disableConstantValueToggle,
        });
      }
      if (field.disableConstantValueToggle) {
        return z
          .object({
            field: field.fixedRepeatedField
              ? z.literal(field.fixedRepeatedField)
              : z.string(),
            constantValueEnabled: z.literal(false),
            mappings: mappings.optional(),
          })
          .describe(
            "Linked source only. Manual content is disabled; preserve the declared mapping configuration."
          );
      }
      const source = entityFieldZodSchema(
        z.array(
          object(
            field.repeated.manualItemFields,
            field.repeated.defaultItemValue,
            `${path}.constantValue[]`
          )
        )
      );
      return source
        .extend({
          ...(field.fixedRepeatedField
            ? { field: z.literal(field.fixedRepeatedField) }
            : {}),
          mappings: mappings.optional(),
        })
        .describe(source.description!);
    }

    if (field.disableConstantValueToggle) {
      return z
        .object({
          field: z.string(),
          constantValueEnabled: z.literal(false),
        })
        .describe("Linked source only. Manual content is disabled.");
    }

    const filter = field.constantValueFilter ?? field.filter;

    const types: string[] = filter?.types ?? [];

    const constants = types.map((type) => {
      if (
        field.disallowTranslation &&
        ["type.string", "type.rich_text_v2"].includes(type)
      ) {
        return z.string();
      }
      const schema = Object.hasOwn(entityConstantZodSchemas, type)
        ? entityConstantZodSchemas[type]
        : undefined;

      return schema && filter.includeListsOnly && type === "type.image"
        ? z.object({ assetImage: schema })
        : schema;
    });

    if (!constants.length || constants.some((schema) => !schema)) {
      return omit(
        field,
        path,
        "Entity constant shape is unknown; provide an explicit schema."
      );
    }

    let constant = union(constants as z.ZodType[])!;

    if (filter.includeListsOnly) {
      constant = z.array(constant);
    }
    const generated = entityFieldZodSchema(constant);
    const compatible = generated
      .extend({ constantValue: generated.shape.constantValue.optional() })
      .refine(
        (binding) =>
          binding.constantValueEnabled !== true ||
          binding.constantValue !== undefined,
        {
          path: ["constantValue"],
          message: "Manual bindings require a constant",
        }
      )
      .describe(generated.description!);
    const key = {};
    entityGenerationSchemas.add(compatible, { key });
    requiredEntitySchemas.set(key, generated);
    return compatible;
  };

  const build = (
    field: InferenceField,
    baseline: unknown,
    path: string
  ): z.ZodType | undefined => {
    switch (field.type) {
      case "text":
      case "textarea":
      case "richtext":
      case "code":
      case "dateTimeSelector":
        return z.string();
      case "number": {
        let schema = field.generation?.integer ? z.number().int() : z.number();

        if (field.min !== undefined) {
          schema = schema.min(field.min);
        }
        if (field.max !== undefined) {
          schema = schema.max(field.max);
        }
        // step describes the editor's increment, not a universal integer rule.
        return schema;
      }
      case "radio":
      case "select":
        return optionSchema(field.options);
      case "checkbox": {
        const value = optionSchema(field.options);

        return value ? z.array(value) : undefined;
      }
      case "object":
        return object(field.objectFields, baseline, path);
      case "array": {
        const itemDefaults =
          typeof field.defaultItemProps === "function"
            ? undefined
            : field.defaultItemProps;

        // An empty saved array must not erase the declared default item shape.
        const item =
          itemDefaults ?? (Array.isArray(baseline) ? baseline[0] : undefined);

        let schema = z.array(object(field.arrayFields, item, `${path}[]`));

        if (field.min !== undefined) {
          schema = schema.min(field.min);
        }
        if (field.max !== undefined) {
          schema = schema.max(field.max);
        }
        return schema;
      }
      case "slot":
        return field.generation?.singleChild === true
          ? z.array(z.unknown()).length(1)
          : z.array(z.unknown());
      case "basicSelector": {
        const canonical = (
          key: keyof typeof ThemeOptions
        ): z.ZodType | undefined => {
          if (key === "MAX_WIDTH") return widthZodSchema;
          if (key === "SITE_COLOR") return siteColorZodSchema;
          if (key === "BACKGROUND_COLOR") return backgroundColorZodSchema;
          return optionSchema(
            resolveCanonicalSelectorGroups(key).flatMap(
              ({ options }) => options
            )
          );
        };
        if (field.optionGroups) {
          const schemas = field.optionGroups.map(
            (group: { options: unknown }) => optionSchema(group.options)
          );
          return schemas.every((schema: z.ZodType | undefined) => schema)
            ? union(schemas)
            : undefined;
        }
        return typeof field.options === "string"
          ? canonical(field.options as keyof typeof ThemeOptions)
          : optionSchema(field.options);
      }
      case "multiSelector": {
        const value = optionSchema(field.options);

        return value
          ? z.object({
              selections: z.array(z.object({ value: value.optional() })),
            })
          : undefined;
      }
      case "themeColor":
        return field.options === "BACKGROUND_COLOR"
          ? backgroundColorZodSchema
          : siteColorZodSchema;
      case "translatableString":
        return translatableStringZodSchema;
      case "entityField":
        return entity(field, baseline, path);
      case "image":
        return imageZodSchema;
      case "video":
        return videoZodSchema;
      case "ctaSelector":
        return ctaSelectorZodSchema;
      case "comprehensiveCTA":
        return comprehensiveCtaZodSchema;
      case "fontSizeSelector":
        return z.enum([
          "default",
          ...fontSizeOptions(field.includeLargeSizes ?? true).map(
            ({ value }) => value
          ),
        ]);
      case "optionalNumber":
        return z.union([
          z.number(),
          z.literal("__ve_optionalNumber_hide__"),
          z.null(),
        ]);
      case "styledText":
        return styledTextZodSchema(!!field.includeColor);
      case "styledButton":
        return styledButtonZodSchema;
      case "styledLink":
        return styledLinkZodSchema;
      case "styledImage":
        return styledImageZodSchema;
      case "styledPageSection":
        return styledPageSectionZodSchema;
      default:
        return undefined;
    }
  };

  const infer = (
    field: InferenceField,
    baseline: unknown,
    path: string
  ): z.ZodType | undefined => {
    const settings = field.generation;

    if (settings?.exclude) {
      return undefined;
    }

    let schema: z.ZodType | undefined;

    if (settings?.schema && typeof settings.schema !== "function") {
      schema = settings.schema;
    } else {
      const start = omissions.length;

      schema = build(field, baseline, path);
      if (!schema) {
        if (omissions.length === start) {
          omit(
            field,
            path,
            "No static schema is available; provide an explicit schema."
          );
        }
        return undefined;
      }
      const description = schema.description;

      if (settings?.nullable) {
        schema = schema.nullable();
      }
      if (!(settings?.required ?? baseline !== undefined)) {
        schema = schema.optional();
      }
      if (description) {
        schema = schema.describe(description);
      }
      if (typeof settings?.schema === "function") {
        schema = settings.schema(schema);
      }
    }
    if (!(schema instanceof z.ZodType)) {
      throw new Error(
        `Generation schema at ${component}.${path}: override must return a Zod schema`
      );
    }
    return appendSchemaInstructions(schema, settings?.instructions);
  };

  return object((fields ?? {}) as FieldMap, defaults, "props");
};
