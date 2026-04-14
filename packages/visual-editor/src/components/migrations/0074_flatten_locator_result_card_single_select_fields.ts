import { Migration } from "../../utils/migrate.ts";

const getFlattenedFieldId = (field: unknown): string | undefined => {
  if (typeof field === "string") {
    return field;
  }

  if (
    field &&
    typeof field === "object" &&
    "selection" in field &&
    field.selection &&
    typeof field.selection === "object" &&
    "value" in field.selection
  ) {
    return typeof field.selection.value === "string"
      ? field.selection.value
      : undefined;
  }

  return undefined;
};

const flattenFieldValue = (
  section: Record<string, unknown> | undefined
): Record<string, unknown> | undefined => {
  if (!section || !("field" in section)) {
    return section;
  }

  const flattenedFieldId = getFlattenedFieldId(section.field);
  return flattenedFieldId === undefined && section.field !== undefined
    ? section
    : { ...section, field: flattenedFieldId };
};

export const flattenLocatorResultCardSingleSelectFields: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      if (!Array.isArray(props.resultCard)) {
        return props;
      }

      return {
        ...props,
        resultCard: props.resultCard.map((item: Record<string, unknown>) => {
          if (!item?.props || typeof item.props !== "object") {
            return item;
          }

          const itemProps = item.props as Record<string, unknown>;
          return {
            ...item,
            props: {
              ...itemProps,
              primaryHeading: flattenFieldValue(
                itemProps.primaryHeading as Record<string, unknown> | undefined
              ),
              secondaryHeading: flattenFieldValue(
                itemProps.secondaryHeading as
                  | Record<string, unknown>
                  | undefined
              ),
              tertiaryHeading: flattenFieldValue(
                itemProps.tertiaryHeading as Record<string, unknown> | undefined
              ),
              hours: flattenFieldValue(
                itemProps.hours as Record<string, unknown> | undefined
              ),
              phone: flattenFieldValue(
                itemProps.phone as Record<string, unknown> | undefined
              ),
              email: flattenFieldValue(
                itemProps.email as Record<string, unknown> | undefined
              ),
              services: flattenFieldValue(
                itemProps.services as Record<string, unknown> | undefined
              ),
              image: flattenFieldValue(
                itemProps.image as Record<string, unknown> | undefined
              ),
            },
          };
        }),
      };
    },
  },
};
