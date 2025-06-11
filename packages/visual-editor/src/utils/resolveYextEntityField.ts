import { YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import { YextStructEntityField } from "../editor/YextStructFieldSelector.tsx";

export const resolveYextEntityField = <T>(
  document: any,
  entityField: YextEntityField<T>
): T | undefined => {
  if (
    !entityField ||
    typeof entityField !== "object" ||
    !("field" in entityField) ||
    !("constantValue" in entityField)
  ) {
    return undefined;
  }

  if (entityField.constantValueEnabled || !entityField.field) {
    return entityField.constantValue as T;
  }

  try {
    // check for the entity field in the document
    const steps: string[] = entityField.field.split(".");
    let missedStep = false;
    let current = document;
    for (let i = 0; i < steps.length; i++) {
      if (current?.[steps[i]] !== undefined) {
        current = current[steps[i]];
      } else {
        missedStep = true;
        break;
      }
    }
    if (!missedStep) {
      return current;
    }
  } catch (e) {
    console.error("Error in resolveYextEntityField:", e);
  }

  console.warn(`The field ${entityField.field} was not found in the document.`);
  return undefined;
};

export const resolveYextStructField = <T extends Record<string, any>>(
  document: any,
  entityField: YextStructEntityField<T>
): T | undefined => {
  const values = resolveYextEntityField(document, entityField);
  if (typeof values === "undefined") {
    return undefined;
  }

  const overridenValues = { ...values }; // shallow copy of values
  for (const key in entityField.constantValueOverride) {
    if (entityField.constantValueOverride[key] && !!overridenValues?.[key]) {
      overridenValues[key] = entityField.constantValue?.[key];
    }
  }

  return overridenValues;
};
