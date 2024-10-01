import { EntityFieldType } from "../components/YextEntityFieldSelector.tsx";

export const resolveYextEntityField = <T>(
  document: any,
  entityField: EntityFieldType
): T | undefined => {
  if (
    !entityField ||
    typeof entityField !== "object" ||
    !("fieldName" in entityField) ||
    !("staticValue" in entityField)
  ) {
    return undefined;
  }

  // return static value if fieldName is not set
  if (entityField.fieldName === "") {
    return entityField.staticValue as T;
  }

  try {
    // check for the entity field in the document
    const steps: string[] = entityField.fieldName.split(".");
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

  // if field not found, return static value as a fallback
  console.warn(
    `The field ${entityField.fieldName} was not found in the document, defaulting to static value ${entityField.staticValue}.`
  );
  return entityField.staticValue as T;
};
