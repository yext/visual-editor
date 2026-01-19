import { Migration } from "../../utils/migrate";

const DEFAULT_TITLE = "Find a Location";

export const updateLocatorHeading: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      if (props.pageHeading?.title) {
        return props;
      }

      return {
        ...props,
        pageHeading: {
          title: {
            en: DEFAULT_TITLE,
            hasLocalizedValue: "true",
          },
        },
      };
    },
  },
};
