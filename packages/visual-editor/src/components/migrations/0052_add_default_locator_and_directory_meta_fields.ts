import { StreamDocument } from "src/utils/applyTheme.ts";
import { Migration } from "../../utils/migrate.ts";

/**
 * Migration to add default meta fields for locator and directory pages.
 * If the title or description fields are missing, add them to the root props.
 * If they are present but have empty constantValue, set a default constantValue.
 * If the field is empty, enable constantValueEnabled.
 */
export const addDefaultLocatorAndDirectoryMetaFields: Migration = {
  root: {
    propTransformation: (
      props: Record<string, any>,
      streamDocument: StreamDocument
    ) => {
      const updatedProps = { ...props };

      if (
        streamDocument.meta?.entityType?.id !== "locator" &&
        !streamDocument.meta?.entityType?.id?.startsWith("dm")
      ) {
        // Don't change entity page sets
        return updatedProps;
      }

      if (
        !("title" in updatedProps) ||
        typeof updatedProps.title !== "object" ||
        !updatedProps.title
      ) {
        updatedProps.title = {
          field: "",
          constantValue: "",
          constantValueEnabled: true,
        };
      }

      if (
        !("description" in updatedProps) ||
        typeof updatedProps.description !== "object" ||
        !updatedProps.description
      ) {
        updatedProps.description = {
          field: "",
          constantValue: "",
          constantValueEnabled: true,
        };
      }

      if (updatedProps.title.constantValue === "") {
        if (streamDocument.meta?.entityType?.id === "locator") {
          updatedProps.title.constantValue = {
            en: "Find Locations",
            hasLocalizedValue: "true",
          };
        } else {
          // PLACEHOLDER will be dynamically replaced in resolveData
          // by the appropriate title based on DM level
          updatedProps.title.constantValue = {
            en: "PLACEHOLDER",
            hasLocalizedValue: "true",
          };
        }
      }
      if (updatedProps.description.constantValue === "") {
        if (streamDocument.meta?.entityType?.id === "locator") {
          updatedProps.description.constantValue = {
            en: "Find the right location for you.",
            hasLocalizedValue: "true",
          };
        } else {
          // PLACEHOLDER will be dynamically replaced in resolveData
          // by the appropriate description based on DM level
          updatedProps.description.constantValue = {
            en: "PLACEHOLDER",
            hasLocalizedValue: "true",
          };
        }
      }

      if (updatedProps.title.field === "") {
        updatedProps.title.constantValueEnabled = true;
      }

      if (updatedProps.description.field === "") {
        updatedProps.description.constantValueEnabled = true;
      }

      return updatedProps;
    },
  },
};
