import { YextEntityField } from "../components/editor/YextEntityFieldSelector.tsx";

export const resolveYextEntityField = <T>(
  document: any,
  entityField: YextEntityField
): T | undefined => {
  if (
    !entityField ||
    typeof entityField !== "object" ||
    !("field" in entityField) ||
    !("constantValue" in entityField)
  ) {
    return undefined;
  }

  if (entityField.constantValueEnabled) {
    return entityField.constantValue as T;
  }
  if (entityField.field === "") {
    return undefined;
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
