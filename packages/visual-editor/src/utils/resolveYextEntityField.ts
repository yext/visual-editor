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

  // If constant value is enabled, and the value is an object (for localized strings),
  // we need to resolve any embedded fields in the string for the current locale.
  if (
    entityField.constantValueEnabled &&
    entityField.constantValue &&
    typeof entityField.constantValue === "object"
  ) {
    // Add an index signature to help TypeScript understand the type
    const constantValueObj = entityField.constantValue as {
      [key: string]: any;
    };

    const locale = document?.locale as string | undefined;

    // If we don't have a locale or the constant value for the locale is not a string, we can't resolve.
    if (!locale || typeof constantValueObj[locale] !== "string") {
      return entityField.constantValue as T;
    }

    const constantValueForLocale = constantValueObj[locale];
    const embeddedFieldRegex = /\[\[(.*?)\]\]/g;

    const resolvedString = constantValueForLocale.replace(
      embeddedFieldRegex,
      (match, fieldName) => {
        const trimmedFieldName = fieldName.trim();
        if (!trimmedFieldName) {
          return "";
        }

        // Construct a temporary YextEntityField for the embedded field and resolve it.
        const embeddedEntityField: YextEntityField<unknown> = {
          field: trimmedFieldName,
          constantValue: undefined,
          constantValueEnabled: false,
        };

        const resolvedValue = resolveYextEntityField(
          document,
          embeddedEntityField
        );

        if (resolvedValue === undefined || resolvedValue === null) {
          // If an embedded field can't be resolved, replace it with an empty string.
          return "";
        }

        // If the resolved value is an object, stringify it.
        if (typeof resolvedValue === "object") {
          return JSON.stringify(resolvedValue);
        }

        return String(resolvedValue);
      }
    );

    // Return a new object with the resolved value for the current locale.
    const resolvedConstantValue = {
      ...entityField.constantValue,
      [locale]: resolvedString,
    };
    return resolvedConstantValue as T;
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
  let structValues = resolveYextEntityField(document, entityField);
  if (!structValues) {
    structValues = Object.fromEntries(
      Object.keys(entityField.constantValueOverride).map(([key]) => [
        key,
        undefined,
      ])
    ) as T;
  }

  const structValuesWithOverrides = { ...structValues };
  for (const key in entityField.constantValueOverride) {
    if (entityField.constantValueOverride[key]) {
      structValuesWithOverrides[key] = entityField.constantValue?.[key];
    }
  }

  return structValuesWithOverrides;
};
