import { toast } from "sonner";
import { getEntityFieldDisplayName } from "../editor/yextEntityFieldUtils.ts";
import { type StreamFields } from "../types/entityFields.ts";
import { pt } from "./i18n/platform.ts";
import { resolveField } from "./resolveYextEntityField.ts";
import { type StreamDocument } from "./types/StreamDocument.ts";

const warnedFieldsByDocument = new WeakMap<StreamDocument, Set<string>>();

/**
 * Warns once per document and requested field path when linked entity
 * resolution falls back to the first value after traversing a multi-value
 * reference.
 */
export const warnOnMultiValueLinkedEntityTraversal = (
  streamDocument: StreamDocument,
  fieldPath: string,
  entityFields: StreamFields | null
): void => {
  const resolution = resolveField(streamDocument, fieldPath);
  if (!resolution.traversedMultiValueReference) {
    return;
  }

  const warnedFields = warnedFieldsByDocument.get(streamDocument);
  if (warnedFields?.has(fieldPath)) {
    return;
  }

  if (warnedFields) {
    warnedFields.add(fieldPath);
  } else {
    warnedFieldsByDocument.set(streamDocument, new Set([fieldPath]));
  }

  toast.warning(
    pt(
      "linkedEntityMultiValueWarning",
      "{{linkedField}} contains multiple linked entities. Using the first one for {{resolvedField}}.",
      {
        linkedField:
          getEntityFieldDisplayName(
            resolution.multiValueReferenceField ?? fieldPath,
            entityFields
          ) ??
          resolution.multiValueReferenceField ??
          fieldPath,
        resolvedField:
          getEntityFieldDisplayName(fieldPath, entityFields) ?? fieldPath,
      }
    )
  );
};
