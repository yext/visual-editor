import { Migration } from "../../utils/migrate.ts";

export const addLocatorAutoSearch = {
  Locator: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      autoSearchOnMapMove: props.autoSearchOnMapMove ?? false,
    }),
  },
} satisfies Migration;
