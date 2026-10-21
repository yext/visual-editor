import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import { unwrapZodSchema as unwrap } from "../utils/unwrapZodSchema.ts";
import { clone, type SavedComponent } from "./authored.ts";
import { applyAuthoredValueEdits } from "./editValues.ts";
import { generationFields } from "./slottedItemSource.ts";
import type { GenerationComponent } from "../../utils/generationCatalog.ts";
import type { AuthoredValueEdit } from "./editProtocol.ts";

const isLocale = (key: string, locales: string[]) =>
  locales.includes(key) || /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(key);

const isText = (schema: z.ZodType): boolean => {
  const node = unwrap(schema);
  return (
    node instanceof z.ZodString ||
    (node instanceof z.ZodUnion &&
      node.options.every((option) => isText(option as z.ZodType))) ||
    (node instanceof z.ZodObject &&
      Object.keys(node.shape).sort().join(",") === "html,json" &&
      unwrap(node.shape.html) instanceof z.ZodString &&
      unwrap(node.shape.json) instanceof z.ZodString)
  );
};

/** One definition for generation, inspection, and strict-schema compilation. */
export const localizedTextSchema = (
  schema: z.ZodType,
  locales: string[] = []
): z.ZodObject | undefined => {
  const node = unwrap(schema);
  if (
    !(node instanceof z.ZodObject) ||
    !node.shape.defaultValue ||
    !isText(node.shape.defaultValue)
  )
    return;
  const catchall = node.def.catchall as z.ZodType | undefined;
  if (catchall && catchall.def.type !== "never")
    return isText(catchall) ? node : undefined;
  return Object.keys(node.shape).some(
    (key) => isLocale(key, locales) && isText(node.shape[key])
  )
    ? node
    : undefined;
};

const overrides = (
  value: Record<string, any>,
  schema: z.ZodObject,
  locales: string[]
) => {
  const catchall = schema.def.catchall as z.ZodType | undefined;
  const open = !!catchall && catchall.def.type !== "never";
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, item]) =>
        item !== undefined &&
        key !== "defaultValue" &&
        key !== "hasLocalizedValue" &&
        (isLocale(key, locales) || (open && !Object.hasOwn(schema.shape, key)))
    )
  );
};

type Location = { parts: string[]; group: (string | null)[] };
type TextVisitor = (
  value: Record<string, any>,
  schema: z.ZodObject,
  location: Location
) => Record<string, any>;

/** Native slots are separate component trees; ordinary arrays carry no row identities. */
const mapText = (
  value: any,
  schema: z.ZodType,
  field: Fields[string] | undefined,
  locales: string[],
  visit: TextVisitor,
  create = false,
  readOnly: Record<string, boolean> = {},
  location: Location = { parts: [], group: [] }
): any => {
  if (value === undefined || value === null || field?.type === "slot")
    return value;
  const node = unwrap(schema);
  if (node instanceof z.ZodUnion) {
    const options = node.options as z.ZodType[];
    const localized = options
      .map((option) => localizedTextSchema(option, locales))
      .find(Boolean);
    if (
      create &&
      localized &&
      localized.shape.defaultValue.safeParse(value).success
    ) {
      return mapText(
        { defaultValue: value },
        localized,
        field,
        locales,
        visit,
        create,
        readOnly,
        location
      );
    }
    const branch =
      options.find(
        (option) =>
          typeof value === "object" &&
          Object.hasOwn(value, "defaultValue") &&
          localizedTextSchema(option, locales) &&
          option.safeParse(value).success
      ) ?? options.find((option) => option.safeParse(value).success);
    return branch
      ? mapText(
          value,
          branch,
          field,
          locales,
          visit,
          create,
          readOnly,
          location
        )
      : value;
  }
  const localized = localizedTextSchema(node, locales);
  if (localized && typeof value === "object" && !Array.isArray(value))
    return visit(value, localized, location);
  if (node instanceof z.ZodArray && Array.isArray(value)) {
    return value.map((item, index) =>
      mapText(
        item,
        node.element as z.ZodType,
        field?.type === "array"
          ? { type: "object", objectFields: field.arrayFields }
          : undefined,
        locales,
        visit,
        create,
        readOnly,
        {
          parts: [...location.parts, String(index)],
          group: [...location.group, null],
        }
      )
    );
  }
  if (node instanceof z.ZodObject && typeof value === "object") {
    const result = { ...value };
    for (const [key, child] of Object.entries(node.shape)) {
      if (
        !Object.hasOwn(result, key) ||
        (!location.parts.length && readOnly[key])
      )
        continue;
      result[key] = mapText(
        result[key],
        child as z.ZodType,
        field?.type === "object" ? field.objectFields[key] : undefined,
        locales,
        visit,
        create,
        readOnly,
        { parts: [...location.parts, key], group: [...location.group, key] }
      );
    }
    return result;
  }
  return value;
};

/** New text has a fallback; only explicitly approved layout locales may be populated. */
export const normalizeGeneratedText = (
  value: any,
  schema: z.ZodType,
  field?: Fields[string],
  translate = false,
  locales: string[] = []
): any =>
  mapText(
    value,
    schema,
    field,
    locales,
    (text, localized) => {
      if (text.defaultValue === undefined)
        throw new Error("Generation requires defaultValue for localized text.");
      const localeValues = overrides(text, localized, locales);
      return Object.fromEntries(
        Object.entries(text).filter(
          ([key]) =>
            !Object.hasOwn(localeValues, key) ||
            (translate && locales.includes(key))
        )
      );
    },
    true
  );

type TextRecord = Location & {
  hasDefaultValue: boolean;
  overrides: Record<string, any>;
};
const textRecords = (
  props: Record<string, any>,
  config: GenerationComponent,
  locales: string[],
  readOnly: Record<string, boolean> = {}
) => {
  const records: TextRecord[] = [];
  if (config?.generation)
    mapText(
      props,
      config.generation.props,
      { type: "object", objectFields: generationFields(config) },
      locales,
      (value, schema, location) => {
        records.push({
          ...location,
          hasDefaultValue: value.defaultValue !== undefined,
          overrides: overrides(value, schema, locales),
        });
        return value;
      },
      false,
      readOnly
    );
  return records;
};

/** Every saved override is explicit content, including copies of the fallback and older locales. */
export const localizedTextState = (
  props: Record<string, any>,
  config: GenerationComponent,
  locales: string[],
  readOnly: Record<string, boolean> = {}
) =>
  textRecords(props, config, locales, readOnly).map((record) => ({
    path: record.parts
      .map((key) => `/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`)
      .join(""),
    overrideLocales: Object.keys(record.overrides).sort(),
  }));

const canonical = (value: any): any =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === "object"
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, canonical(value[key])])
        )
      : value;

/** Count complete override bundles, not array indexes, preserving duplicates and locale associations. */
const protectedBundles = (
  records: TextRecord[],
  locales: string[],
  translate: boolean
) => {
  const counts = new Map<string, number>();
  for (const record of records) {
    const protectedValues = Object.fromEntries(
      Object.entries(record.overrides).filter(
        ([locale]) => !translate || !locales.includes(locale)
      )
    );
    if (!Object.keys(protectedValues).length) continue;
    const key = JSON.stringify([record.group, canonical(protectedValues)]);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};

/** A default-only edit cannot add, change, or remove saved locale overrides. No copy synchronization or row matching. */
export const validateLocalizedTextEdits = (
  component: SavedComponent,
  config: GenerationComponent,
  changes: AuthoredValueEdit[],
  locales: string[],
  translate: boolean
): void => {
  const candidate = clone(component);
  applyAuthoredValueEdits(candidate, config, changes);
  const savedText = textRecords(
    component.props,
    config,
    locales,
    component.readOnly
  );
  const editedText = textRecords(
    candidate.props,
    config,
    locales,
    component.readOnly
  );
  const before = protectedBundles(savedText, locales, translate);
  const after = protectedBundles(editedText, locales, translate);
  if (
    before.size !== after.size ||
    [...before].some(([key, count]) => after.get(key) !== count)
  ) {
    throw new Error(
      translate
        ? "Saved locale overrides outside the layout must be preserved."
        : "Translation approval is required to add, change, or remove saved locale overrides. Preserve complete override bundles when replacing arrays."
    );
  }
  // Legacy locale-only text may survive or reorder, but it cannot authorize
  // new copies, changed locale-only bundles, or removal of an existing fallback.
  const legacyCounts = new Map<string, number>();
  const keyFor = (record: TextRecord) =>
    JSON.stringify([record.group, canonical(record.overrides)]);
  for (const record of savedText) {
    if (record.hasDefaultValue) continue;
    const key = keyFor(record);
    legacyCounts.set(key, (legacyCounts.get(key) ?? 0) + 1);
  }
  for (const record of editedText) {
    if (record.hasDefaultValue) continue;
    const key = keyFor(record);
    const remaining = legacyCounts.get(key) ?? 0;
    if (!remaining) {
      throw new Error(
        "New or changed localized text requires defaultValue. Existing locale-only text may only be preserved or reordered."
      );
    }
    legacyCounts.set(key, remaining - 1);
  }
};
