import { hasSlots } from "./editUtils.ts";
import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import { unwrapZodSchema as unwrap } from "../utils/unwrapZodSchema.ts";
import type { GenerationComponent } from "../../vite-plugin/layout-generation/puckGenerationCatalog.ts";
import { clone, type SavedComponent } from "./authored.ts";
import type { AuthoredValueEdit } from "./editProtocol.ts";
import { generationFields } from "./slottedItemSource.ts";

const fail = (path: string): never => {
  throw new Error(`Invalid authored edit at ${path}`);
};

/** Decode a safe JSON pointer without accepting prototype access. */
export const editPath = (path: string): string[] => {
  if (!path.startsWith("/") || /~(?![01])/u.test(path)) {
    fail(path);
  }
  const parts = path
    .slice(1)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
  if (
    parts.some((part) =>
      ["__proto__", "constructor", "prototype"].includes(part)
    )
  ) {
    fail(path);
  }
  return parts;
};

const childField = (field: Fields[string] | undefined, key: string) =>
  field?.type === "object" ? field.objectFields[key] : undefined;

const childSchema = (
  schema: z.ZodObject,
  key: string,
  path: string
): z.ZodType => {
  const child = Object.hasOwn(schema.shape, key)
    ? schema.shape[key]
    : schema.def.catchall;
  if (!child || child.def.type === "never") {
    fail(path);
  }
  return Object.hasOwn(schema.shape, key)
    ? (child as z.ZodType)
    : (child as z.ZodType).optional();
};

/** Patch explicit object keys; ordinary arrays are replaced without inherited values. */
const changeValue = (
  schema: z.ZodType,
  field: Fields[string] | undefined,
  current: any,
  change: AuthoredValueEdit,
  allowIncomplete = false
): any => {
  const node = unwrap(schema);
  if (field?.type === "slot") {
    fail(change.path);
  }
  if (change.kind === "unset") {
    if (
      !schema.safeParse(undefined).success ||
      (!allowIncomplete && hasSlots(field))
    ) {
      fail(change.path);
    }
    // Unsetting a wrapper must not erase properties outside its authored schema.
    if (current !== undefined && !allowIncomplete) {
      changeValue(schema, field, undefined, {
        kind: "set",
        path: change.path,
        value: current,
      });
    }
    return undefined;
  }
  if (change.value === null && schema.safeParse(null).success) {
    if (hasSlots(field)) {
      fail(change.path);
    }
    return null;
  }
  if (node instanceof z.ZodUnion) {
    const incomplete: any[] = [];
    for (const alternative of node.options) {
      try {
        const next = changeValue(
          alternative as z.ZodType,
          field,
          current,
          change,
          allowIncomplete
        );
        if ((alternative as z.ZodType).safeParse(next).success) {
          return next;
        }
        incomplete.push(next);
      } catch {
        // Try the other declared branches without widening the editable schema.
      }
    }
    if (allowIncomplete && incomplete.length) {
      return incomplete[0];
    }
    return fail(change.path);
  }
  const input = change.value;
  if (
    node instanceof z.ZodObject &&
    input !== null &&
    typeof input === "object" &&
    !Array.isArray(input)
  ) {
    const next =
      current && typeof current === "object" && !Array.isArray(current)
        ? clone(current)
        : {};
    for (const [key, value] of Object.entries(input)) {
      editPath(`/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`);
      next[key] = changeValue(
        childSchema(node, key, change.path),
        childField(field, key),
        next[key],
        { ...change, value },
        allowIncomplete
      );
    }
    if (!allowIncomplete && !schema.safeParse(next).success) {
      fail(change.path);
    }
    return next;
  }
  if (hasSlots(field) && !(allowIncomplete && node instanceof z.ZodArray)) {
    fail(change.path);
  }
  if (node instanceof z.ZodArray && Array.isArray(input)) {
    const itemField =
      field?.type === "array"
        ? { type: "object" as const, objectFields: field.arrayFields }
        : undefined;
    const next = input.map((value) =>
      changeValue(
        node.element as z.ZodType,
        itemField,
        undefined,
        {
          ...change,
          value,
        },
        allowIncomplete
      )
    );
    if (!allowIncomplete && !schema.safeParse(next).success) {
      fail(change.path);
    }
    return next;
  }
  if (!schema.safeParse(input).success) {
    fail(change.path);
  }
  return clone(input);
};

/** Apply sibling edits together so union constraints see their combined result. */
const changeValues = (
  schema: z.ZodType,
  field: Fields[string] | undefined,
  current: any,
  changes: { parts: string[]; change: AuthoredValueEdit }[],
  allowIncomplete: boolean
): any => {
  if (!changes.length) {
    return current;
  }
  const { parts, change } = changes[0];
  if (!parts.length) {
    return changeValue(schema, field, current, change, allowIncomplete);
  }
  if (field?.type === "slot") {
    return fail(change.path);
  }
  const node = unwrap(schema);
  if (node instanceof z.ZodUnion) {
    const incomplete: any[] = [];
    for (const alternative of node.options) {
      try {
        const next = changeValues(
          alternative as z.ZodType,
          field,
          current,
          changes,
          allowIncomplete
        );
        if ((alternative as z.ZodType).safeParse(next).success) {
          return next;
        }
        incomplete.push(next);
      } catch {
        // Every changed path must be valid within the same declared branch.
      }
    }
    if (allowIncomplete && incomplete.length) {
      return incomplete[0];
    }
    return fail(change.path);
  }
  if (!(node instanceof z.ZodObject)) {
    return fail(change.path);
  }
  const next =
    current && typeof current === "object" && !Array.isArray(current)
      ? clone(current)
      : {};
  const groups = new Map<string, typeof changes>();
  for (const {
    parts: [key, ...rest],
    change,
  } of changes) {
    const group = groups.get(key) ?? [];
    group.push({ parts: rest, change });
    groups.set(key, group);
  }
  for (const [key, group] of groups) {
    const value = changeValues(
      childSchema(node, key, group[0].change.path),
      childField(field, key),
      next[key],
      group,
      allowIncomplete
    );
    if (value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
  }
  return next;
};

/** Apply only declared authored paths, preserving all unmentioned props. */
export const applyAuthoredValueEdits = (
  component: SavedComponent,
  config: GenerationComponent,
  changes: AuthoredValueEdit[],
  allowIncomplete = false
) => {
  if (!config.generation) {
    throw new Error("Component has no generation schema.");
  }
  const paths = changes.map((change) => editPath(change.path));
  paths.forEach((parts, index) => {
    if (
      !Object.hasOwn(config.generation!.props.shape, parts[0]) ||
      ["id", "puck", "readOnly"].includes(parts[0]) ||
      component.readOnly?.[parts[0]]
    ) {
      fail(changes[index].path);
    }
    if (
      paths.some(
        (other, otherIndex) =>
          otherIndex !== index &&
          other.length <= parts.length &&
          other.every((part, position) => part === parts[position])
      )
    ) {
      throw new Error("Authored edit paths overlap.");
    }
  });
  component.props = changeValues(
    config.generation.props,
    { type: "object", objectFields: generationFields(config) },
    component.props,
    changes.map((change, index) => ({ parts: paths[index], change })),
    allowIncomplete
  );
};

/** Resolve a declared native slot; only new components may create absent slots. */
export const editSlot = (
  component: SavedComponent,
  config: GenerationComponent,
  path: string,
  create = false
): SavedComponent[] => {
  let schema: z.ZodType = config.generation!.props;
  let field: Fields[string] | undefined = {
    type: "object",
    objectFields: generationFields(config),
  };
  let value = component.props;
  const parts = editPath(path);
  for (const [index, key] of parts.entries()) {
    let node = unwrap(schema);
    if (node instanceof z.ZodUnion) {
      const alternatives = node.options as z.ZodType[];
      const selected =
        alternatives.find((option) => option.safeParse(value).success) ??
        alternatives.find((option) => {
          const branch = unwrap(option);
          return (
            branch instanceof z.ZodObject &&
            Object.hasOwn(branch.shape, key) &&
            Object.entries(branch.shape).every(([name, child]) => {
              const schema = unwrap(child as z.ZodType);
              return (
                !["literal", "enum"].includes(schema.def.type) ||
                !Object.hasOwn(value, name) ||
                schema.safeParse(value[name]).success
              );
            })
          );
        });
      node = unwrap(selected)!;
    }
    if (node instanceof z.ZodObject) {
      schema = childSchema(node, key, path);
      field = childField(field, key);
    } else if (
      node instanceof z.ZodArray &&
      /^(0|[1-9]\d*)$/.test(key) &&
      Array.isArray(value) &&
      Number(key) < value.length
    ) {
      schema = node.element as z.ZodType;
      field =
        field?.type === "array"
          ? { type: "object", objectFields: field.arrayFields }
          : undefined;
    } else {
      return fail(path);
    }
    if (index === parts.length - 1) {
      if (field?.type !== "slot" || !(unwrap(schema) instanceof z.ZodArray)) {
        fail(path);
      }
      const container = value as Record<string, any>;
      if (create && container[key] === undefined) {
        container[key] = [];
      }
      if (!Array.isArray(container[key])) {
        fail(path);
      }
      return container[key];
    }
    const container = value as Record<string, any>;
    if (
      create &&
      container[key] === undefined &&
      unwrap(schema) instanceof z.ZodObject
    ) {
      container[key] = {};
    }
    value = container[key];
    if (!value || typeof value !== "object") {
      fail(path);
    }
  }
  return fail(path);
};
