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
 * Empty titles now fail page generation. Ensure the title is not set to
 * constantValueEnabled with an empty constantValue.
 */
export const emptyTitleFix: Migration = {
  root: {
    propTransformation: (
      props: Record<string, any>,
      streamDocument: StreamDocument
    ) => {
      try {
        if (props?.title && !props.title.constantValueEnabled) {
          return props;
        }

        const updatedProps = { ...props };

        if (!props?.title?.constantValue) {
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
            if (!props.title.constantValue?.[locale]) {
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
