import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import type { GeneratedContent } from "../../local-editor/types.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";

type SlotTraversalContext = {
  componentType: string;
  propertyPath: string[];
  registerIds: boolean;
};

const componentShape = z
  .object({
    type: z.string(),
    props: z.record(z.string(), z.unknown()),
    readOnly: z.record(z.string(), z.boolean()).optional(),
  })
  .strict();
export const generatedContentShape = z
  .object({
    content: z.array(componentShape),
  })
  .strict();

export const generationResponseShape = z
  .object({
    text: z.string(),
    spec: generatedContentShape.nullable(),
  })
  .strict();

export const buildGenerationPrompt = (
  catalog: PuckGenerationCatalog,
  componentNames = catalog.componentNames,
  _stripMetadata: (data: GeneratedContent) => GeneratedContent = (data) => data
): string => {
  const components = Object.fromEntries(
    componentNames.map((name) => [name, catalog.data.components[name]])
  );
  const guidance = Object.fromEntries(
    Object.entries(components).map(([name, component]) => [
      name,
      {
        description: component.description,
        nativePropsSchema: z.toJSONSchema(component.props, {
          io: "input",
          reused: "ref",
        }),
        declaredSlotPaths:
          name === "MainContent" ? [] : describeSlots(component.fields),
        children:
          name === "MainContent"
            ? describeSlots(component.fields)[0]
            : undefined,
        nestedOnly: component.nestedOnly ?? false,
      },
    ])
  );
  return (
    catalog.schema.createCatalog({ components }).prompt({
      customRules: catalog.puckOptions.rootAllowedComponentIds
        ? [
            `Only these components may appear in top-level content: ${catalog.puckOptions.rootAllowedComponentIds.join(", ")}`,
          ]
        : [],
    }) +
    "\n\nReconstructed native props schemas and declared slot paths:\n" +
    JSON.stringify(guidance)
  );
};

const describeSlots = (
  fields: Fields | undefined
): Array<Record<string, unknown>> => {
  const slots: Array<Record<string, unknown>> = [];
  const visit = (definitions: Fields | undefined, path: string[]) => {
    for (const [name, field] of Object.entries(definitions ?? {})) {
      const current = [...path, name];
      if (field.type === "slot") {
        const pointer = current
          .map((segment) => segment.replace(/~/g, "~0").replace(/\//g, "~1"))
          .join("/");
        slots.push({
          path: `/${pointer}`,
          allow: field.allow,
          disallow: field.disallow,
        });
      } else if (field.type === "object") visit(field.objectFields, current);
      else if (field.type === "array")
        visit(field.arrayFields, [...current, "*"]);
    }
  };
  visit(fields, []);
  return slots;
};

/** Traverses only declared slots, not arbitrary data arrays or entity references. */
export const validateGeneratedContent = (
  catalog: PuckGenerationCatalog,
  value: unknown
): string[] => {
  const shape = generatedContentShape.safeParse(value);
  if (!shape.success) return [shape.error.message];
  const data = shape.data;
  const errors: string[] = [];
  const ids = new Set<string>();
  const seen = new WeakSet<object>();
  const rejectExpressions = (value: unknown, path: string) => {
    if (!value || typeof value !== "object") return;
    if (seen.has(value)) return;
    seen.add(value);
    if (
      ["$state", "$item", "$index", "$bind", "$computed"].some((key) =>
        Object.hasOwn(value, key)
      )
    )
      errors.push(
        `${path}: json-render expressions are not supported in Puck props`
      );
    for (const [key, child] of Object.entries(value))
      rejectExpressions(child, `${path}.${key}`);
  };
  const fields = (
    props: Record<string, any>,
    definitions: Fields | undefined,
    path: string,
    context: SlotTraversalContext,
    validateValues = true
  ) => {
    for (const [key, field] of Object.entries(definitions ?? {})) {
      const value = props[key];
      if (
        value === undefined ||
        (value === null && !validateValues && field.type !== "slot")
      )
        continue;
      const fieldPath = `${path}.${key}`;
      const childContext = {
        ...context,
        propertyPath: [...context.propertyPath, key],
      };
      if (field.type === "slot") {
        if (
          value === null &&
          resolvePropsSchema(
            catalog,
            context.componentType,
            childContext.propertyPath
          )?.safeParse(null).success
        )
          continue;
        if (!Array.isArray(value))
          errors.push(`${fieldPath}: slot must be a component array`);
        else {
          const derived = catalog.data.components[
            context.componentType
          ].derivedSlotPaths?.some(
            (derivedPath) =>
              derivedPath.length === childContext.propertyPath.length &&
              derivedPath.every(
                (segment, index) => segment === childContext.propertyPath[index]
              )
          );
          visit(
            value,
            fieldPath,
            false,
            field,
            context.registerIds && !derived
          );
        }
      } else if (field.type === "object") {
        if (!value || typeof value !== "object" || Array.isArray(value))
          errors.push(`${fieldPath}: expected object`);
        else
          fields(
            value,
            field.objectFields,
            fieldPath,
            childContext,
            validateValues
          );
      } else if (field.type === "array") {
        if (!Array.isArray(value)) errors.push(`${fieldPath}: expected array`);
        else
          value.forEach((item, index) => {
            if (!item || typeof item !== "object" || Array.isArray(item))
              errors.push(`${fieldPath}[${index}]: expected object`);
            else
              fields(
                item,
                field.arrayFields,
                `${fieldPath}[${index}]`,
                childContext,
                validateValues
              );
          });
      } else if (
        validateValues &&
        (field.type === "text" ||
          field.type === "textarea" ||
          field.type === "number")
      ) {
        if (typeof value !== (field.type === "number" ? "number" : "string"))
          errors.push(`${fieldPath}: invalid ${field.type} value`);
      } else if (
        validateValues &&
        (field.type === "select" || field.type === "radio")
      ) {
        if (!field.options.some((option) => option.value === value))
          errors.push(`${fieldPath}: invalid option`);
      }
    }
  };
  const visit = (
    items: unknown[],
    path: string,
    topLevel: boolean,
    slot?: { allow?: string[]; disallow?: string[] },
    registerIds = true
  ) => {
    items.forEach((item, index) => {
      const itemPath = `${path}[${index}]`;
      const result = componentShape.safeParse(item);
      if (!result.success) {
        errors.push(`${itemPath}: ${result.error.message}`);
        return;
      }
      const { type, props } = result.data;
      const component = Object.hasOwn(catalog.data.components, type)
        ? catalog.data.components[type]
        : undefined;
      if (!component) {
        errors.push(`${itemPath}: Unknown component ${type}`);
        return;
      }
      const id = props.id;
      if (typeof id !== "string" || !id.trim())
        errors.push(`${itemPath}: component requires nonempty props.id`);
      else if (registerIds) {
        if (ids.has(id)) errors.push(`${itemPath}: duplicate props.id ${id}`);
        else ids.add(id);
      }
      if (
        topLevel &&
        (component.nestedOnly ||
          (catalog.puckOptions.rootAllowedComponentIds &&
            !catalog.puckOptions.rootAllowedComponentIds.includes(type)))
      )
        errors.push(`${itemPath}: ${type} is not allowed in top-level content`);
      if (
        slot?.disallow?.includes(type) ||
        (slot?.allow?.length && !slot.allow.includes(type))
      )
        errors.push(`${itemPath}: ${type} is not allowed in this slot`);
      if (Object.hasOwn(props, "puck"))
        errors.push(`${itemPath}: puck runtime context must not be saved`);
      const parsedProps = component.props.safeParse(props);
      if (!parsedProps.success)
        errors.push(
          `${itemPath} (${type}, id ${String(id)}): ${parsedProps.error.message}`
        );
      fields(
        props,
        component.fields,
        `${itemPath}.props`,
        { componentType: type, propertyPath: [], registerIds },
        !component.hasFormalProps
      );
    });
  };
  rejectExpressions(data, "spec");
  visit(data.content, "content", true);
  const result = catalog.validate(data);
  if (!result.success)
    errors.push(result.error?.message ?? "Invalid Puck data");
  return errors;
};

const resolvePropsSchema = (
  catalog: PuckGenerationCatalog,
  componentType: string,
  path: string[]
): z.ZodType | undefined => {
  let schema: z.ZodType | undefined =
    catalog.data.components[componentType]?.props;
  for (const segment of path) {
    if (!schema) return undefined;
    let def = schema.def as any;
    while (["optional", "nullable", "default", "prefault"].includes(def.type)) {
      schema = def.innerType as z.ZodType;
      def = schema.def as any;
    }
    if (def.type === "object")
      schema = (schema as z.ZodObject).shape[segment] as z.ZodType | undefined;
    else if (def.type === "array" && /^\d+$/.test(segment))
      schema = def.element as z.ZodType;
    else return undefined;
  }
  return schema;
};

export const validateGeneratedText = (
  catalog: PuckGenerationCatalog,
  text: string
): string[] => {
  try {
    const result = parseGenerationResponse(text);
    return result.spec === null
      ? []
      : validateGeneratedContent(catalog, result.spec);
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }
};

/** The model response contains no editor-owned root or zones. */
export const parseGenerationResponse = (
  text: string
): { text: string; spec: GeneratedContent | null } =>
  generationResponseShape.parse(JSON.parse(text)) as {
    text: string;
    spec: GeneratedContent | null;
  };
