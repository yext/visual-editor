import { Fields } from "@measured/puck";
import { YextEntityField } from "../components/editor/YextEntityFieldSelector.tsx";

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

export const resolveYextSubfield = <T>(
  parent: any,
  field: YextEntityField<T> | undefined
): T | undefined => {
  // If the constant value is enabled, return the constant value
  if (field?.constantValueEnabled) {
    return field.constantValue;
  }

  // If no field set, return undefined
  if (!field?.field) {
    return undefined;
  }

  // Return the parent value only if the parent is not
  // a list of objects and the parent's type matches
  // the expected subfield type
  if (
    typeof parent !== "object" &&
    typeof parent === typeof field.constantValue
  ) {
    if (field.field !== "") {
      return parent;
    }
    return undefined;
  }

  // Determine the subfield to read from parent
  const splitName = field.field.split(".");

  if (splitName.length < 2) {
    return undefined;
  }

  const subfieldName = splitName.pop();
  if (!subfieldName) {
    return;
  }

  return parent[subfieldName] as T;
};

export const handleResolveFieldsForCollections = (
  data: { props: Record<string, any> },
  {
    fields,
    parent,
    lastData,
  }: {
    fields: Fields<any>;
    lastData: { props: Record<string, any> } | null;
    parent: { props: Record<string, any> } | null;
  }
) => {
  // It is a collection if there is a parent with
  // constantValue disabled and a field name selected
  const isCollection =
    !!parent &&
    !parent.props.collection.items.constantValueEnabled &&
    parent.props.collection.items.field !== "";

  // Clear out the props when the parent or selected collection changes
  if (Object.keys(fields).every((fieldName) => data.props[fieldName])) {
    Object.keys(fields).forEach((fieldName) => {
      if (
        (lastData && lastData.props.isCollection != isCollection) ||
        (parent &&
          !parent.props.collection.items.constantValueEnabled &&
          !data.props[fieldName].field.includes(
            parent.props.collection.items.field
          ))
      ) {
        data.props[fieldName].field = "";
      }
    });
  }

  // Set the child's isCollection prop
  data.props.isCollection = isCollection;
};
