import { toast } from "sonner";
import { getEntityFieldDisplayName } from "../editor/yextEntityFieldUtils.ts";
import { type StreamFields } from "../types/entityFields.ts";
import { pt } from "./i18n/platform.ts";
import { resolveField } from "./resolveYextEntityField.ts";
import { type StreamDocument } from "./types/StreamDocument.ts";

const warnedFieldsByDocument = new WeakMap<object, Set<string>>();

/**
 * Warns once per document and requested field path when linked entity
 * resolution falls back to the first value after traversing a multi-value
 * reference.
 */
export const warnOnMultiValueLinkedEntityTraversal = (
  streamDocument: StreamDocument | Record<string, unknown>,
  fieldPath: string,
  entityFields: StreamFields | null,
  displayFieldPath?: string
): void => {
  const resolution = resolveField(streamDocument, fieldPath);
  if (!resolution.traversedMultiValueReference) {
    return;
  }

  const warningFieldPath = displayFieldPath ?? fieldPath;
  // Scoped embedded fields resolve against a relative path on the current item,
  // but the warning should still name the full linked field path shown to users.
  const linkedFieldPath =
    displayFieldPath &&
    resolution.multiValueReferenceField &&
    displayFieldPath.endsWith(fieldPath)
      ? `${displayFieldPath.slice(0, -fieldPath.length)}${resolution.multiValueReferenceField}`
      : (resolution.multiValueReferenceField ?? warningFieldPath);

  const warnedFields = warnedFieldsByDocument.get(streamDocument);
  if (warnedFields?.has(warningFieldPath)) {
    return;
  }

  if (warnedFields) {
    warnedFields.add(warningFieldPath);
  } else {
    warnedFieldsByDocument.set(streamDocument, new Set([warningFieldPath]));
  }

  toast.warning(
    pt(
      "linkedEntityMultiValueWarning",
      "{{linkedField}} contains multiple linked entities. Using the first one for {{resolvedField}}.",
      {
        linkedField: getEntityFieldDisplayName(linkedFieldPath, entityFields),
        resolvedField: getEntityFieldDisplayName(
          warningFieldPath,
          entityFields
        ),
      }
    )
  );
};
