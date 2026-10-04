import type { StreamDocument } from "./types/StreamDocument.ts";

const isRecord = (value: unknown): value is Record<string, any> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

/** Converts one legacy image binding to the mapped/static image-field format. */
export const migrateImageField = (
  value: unknown,
  streamDocument: StreamDocument
): Record<string, unknown> => {
  const authored = isRecord(value) ? value : {};
  const mapped =
    typeof authored.field === "string" &&
    authored.field !== "" &&
    !authored.constantValueEnabled;
  const source = "constantValue" in authored ? authored.constantValue : value;
  const image =
    isRecord(source) && isRecord(source.image) ? source.image : source;
  const locale = streamDocument.locale ?? "en";
  const localized =
    isRecord(image) &&
    (image.hasLocalizedValue === "true" || "defaultValue" in image)
      ? {
          ...Object.fromEntries(
            Object.entries(image).map(([key, entry]) => [
              key,
              isRecord(entry) && isRecord(entry.image) ? entry.image : entry,
            ])
          ),
          defaultValue: (() => {
            const entry = image.defaultValue ?? image[locale];
            return isRecord(entry) && isRecord(entry.image)
              ? entry.image
              : entry;
          })(),
          hasLocalizedValue: "true",
        }
      : { defaultValue: image, hasLocalizedValue: "true" };

  return {
    field: mapped ? authored.field : "",
    constantValueEnabled: !mapped,
    constantValue: localized,
  };
};
