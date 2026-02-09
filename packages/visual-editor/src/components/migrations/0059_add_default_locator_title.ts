import { Migration } from "../../utils/migrate.ts";

const DEFAULT_TITLE = "Find a Location";

export const addDefaultLocatorPageTitle: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      if (props.pageHeading?.title?.en) {
        return props;
      }

      return {
        ...props,
        pageHeading: {
          ...props.pageHeading,
          title: {
            ...props.pageHeading?.title,
            en: DEFAULT_TITLE,
            hasLocalizedValue: "true",
          },
        },
      };
    },
  },
};
