import { toast } from "sonner";
import { pt } from "./i18n/platform.ts";
import { resolveField } from "./resolveYextEntityField.ts";
import { type StreamDocument } from "./types/StreamDocument.ts";

const warnedFieldsByDocument = new WeakMap<StreamDocument, Set<string>>();

/**
 * Warn once per document/field when linked entity resolution traverses a
 * multi-value reference and falls back to the first linked entity.
 */
export const warnOnMultiValueLinkedEntityTraversal = (
  streamDocument: StreamDocument,
  fieldPath: string
): void => {
  const resolution = resolveField(streamDocument, fieldPath);
  if (!resolution.traversedMultiValueReference) {
    return;
  }

  const warnedFields = warnedFieldsByDocument.get(streamDocument);
  if (warnedFields?.has(fieldPath)) {
    return;
  }

  warnedFieldsByDocument.set(
    streamDocument,
    warnedFields ? warnedFields.add(fieldPath) : new Set([fieldPath])
  );

  toast.warning(
    pt(
      "linkedEntityMultiValueWarning",
      "Multiple linked entities were found for {{fieldName}}. Using the first linked entity.",
      {
        fieldName: fieldPath,
      }
    )
  );
};
