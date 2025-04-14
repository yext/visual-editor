import { Fields } from "@measured/puck";
import { YextEntityField } from "../editor/YextEntityFieldSelector.tsx";

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

/**
 * handleResolveFieldsForCollections determines if lastFields
 * should be returned, returns filters for YextCollectionSubfieldSelector,
 * and resets prop data when isCollection changes.
 * @param data the data object from Puck's resolveFields
 * @param params the params object from Puck's resolveFields
 */
export const handleResolveFieldsForCollections = (
  data: { props: Record<string, any> },
  params: {
    lastFields: Fields<any>;
    parent: { props: Record<string, any> } | null;
  }
): {
  /** No field updates need. Return params.lastFields */
  shouldReturnLastFields: boolean;
  /**
   * Whether the component is currently in a CollectionSection
   * with a field set. Use in YextCollectionSubfieldSelector.
   */
  isCollection: boolean;
  /** The parent's field selected field if applicable. Use in YextCollectionSubfieldSelector. */
  directChildrenFilter: string | undefined;
} => {
  const { parent, lastFields } = params;

  // It isCollection if in a parent and the parent does not have constantValueEnabled
  const isCollection =
    parent?.props.collection &&
    !parent.props.collection.items.constantValueEnabled;

  const collectionField = isCollection
    ? params.parent!.props.collection.items.field
    : undefined;

  // Sometimes puck returns only the originally defined fields
  // in lastFields so we should regenerate the fields in that case.
  // Determined by comparing the fields length to the props length
  // (minus the non-field-based props of id and collection)
  const lastFieldsIsComplete =
    Object.keys(data.props).filter(
      (propName) => propName !== "id" && propName !== "collection"
    ).length === Object.keys(lastFields).length;

  // If isCollection has not changed, do not update the fields.
  // Updating the fields will cause text fields to lose focus.
  if (
    lastFieldsIsComplete &&
    parent?.props.collection?.items.field ===
      data.props.collection?.items.field &&
    parent?.props.collection?.items.constantValueEnabled ===
      data.props.collection?.items.constantValueEnabled
  ) {
    // Update the collection prop before returning
    data.props.collection = parent?.props.collection;

    return {
      shouldReturnLastFields: true,
      isCollection,
      directChildrenFilter: collectionField,
    };
  }

  // Clear out the props when the parent or selected collection changes
  if (
    parent?.props.collection?.items.field !==
      data.props.collection?.items.field ||
    parent?.props.collection?.items.constantValueEnabled !==
      data.props.collection?.items.constantValueEnabled
  ) {
    Object.keys(data.props).forEach((fieldName) => {
      if (
        // type check for YextEntityField
        typeof data.props[fieldName] === "object" &&
        "field" in data.props[fieldName]
      ) {
        data.props[fieldName].field = "";
      }
    });
  }

  // Update the collection prop before returning
  data.props.collection = parent?.props.collection;

  return {
    shouldReturnLastFields: false,
    isCollection,
    directChildrenFilter: collectionField,
  };
};
