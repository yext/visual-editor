import { StreamDocument } from "../../utils/types/StreamDocument.ts";
import { Migration } from "../../utils/migrate.ts";
import { getPageSetLocales } from "../../utils/pageSetLocales.ts";

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
          const locales = getPageSetLocales(streamDocument);
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
