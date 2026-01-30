import { StreamDocument } from "../../utils/types/StreamDocument.ts";
import { Migration } from "../../utils/migrate.ts";

const getLocales = (streamDocument: any): string[] => {
  try {
    return JSON.parse(streamDocument._pageset).scope.locales || ["en"];
  } catch {
    return ["en"];
  }
};

/**
 * Migration to add default meta fields for locator and directory pages.
 * If the title or description fields are missing, add them to the root props.
 * If they are present but have empty constantValue, set a default constantValue.
 * If the field is empty, enable constantValueEnabled.
 */
export const emptyTitleFix: Migration = {
  root: {
    propTransformation: (
      props: Record<string, any>,
      streamDocument: StreamDocument
    ) => {
      try {
        if (!props.title.constantValueEnabled) {
          return props;
        }

        const updatedProps = { ...props };

        if (!props.title.constantValue || props.title.constantValue === "") {
          return {
            ...updatedProps,
            title: {
              constantValueEnabled: false,
              field: "name",
              constantValue: {
                hasLocalizedValue: "true",
                en: "",
              },
            },
          };
        }

        if (typeof props.title.constantValue === "object") {
          const locales = getLocales(streamDocument);
          let missingValue = false;
          locales.forEach((locale) => {
            if (
              !props.title.constantValue[locale] ||
              props.title.constantValue[locale] === ""
            ) {
              missingValue = true;
            }
          });

          if (missingValue) {
            return {
              ...updatedProps,
              title: {
                constantValueEnabled: false,
                field: "name",
                constantValue: {
                  ...props.title.constantValue,
                },
              },
            };
          }
        }

        return props;
      } catch {
        return props;
      }
    },
  },
};
