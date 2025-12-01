import { Migration } from "../../utils/migrate.ts";

/**
 * Migration to fix root props (title/description) that are missing constantValue.
 * The isYextEntityField check requires both "field" and "constantValue" to be present,
 * so we need to add constantValue: "" for any entity fields that are missing it.
 */
export const fixRootMetaFieldsMigration: Migration = {
  root: {
    propTransformation: (props: Record<string, any>) => {
      const updatedProps = { ...props };

      // Fix title if it's an entity field missing constantValue
      if (
        updatedProps.title &&
        typeof updatedProps.title === "object" &&
        updatedProps.title !== null &&
        "field" in updatedProps.title &&
        !("constantValue" in updatedProps.title)
      ) {
        updatedProps.title = {
          ...updatedProps.title,
          constantValue: "",
        };
      }

      // Fix description if it's an entity field missing constantValue
      if (
        updatedProps.description &&
        typeof updatedProps.description === "object" &&
        updatedProps.description !== null &&
        "field" in updatedProps.description &&
        !("constantValue" in updatedProps.description)
      ) {
        updatedProps.description = {
          ...updatedProps.description,
          constantValue: "",
        };
      }

      return updatedProps;
    },
  },
};
