import type { GenerationComponent } from "../../../../utils/createPuckGenerationCatalog.ts";
import { clone, type SavedComponent } from "../../shared/authoredValues.ts";
import { textRecords, type TextRecord } from "../../shared/localizedText.ts";
import type { AuthoredValueEdit } from "./types.ts";
import { applyAuthoredValueEdits } from "./applyEditsToComponent.ts";

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
    if (!Object.keys(protectedValues).length) {
      continue;
    }
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
    if (record.hasDefaultValue) {
      continue;
    }
    const key = keyFor(record);
    legacyCounts.set(key, (legacyCounts.get(key) ?? 0) + 1);
  }
  for (const record of editedText) {
    if (record.hasDefaultValue) {
      continue;
    }
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
