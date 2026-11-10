import { Migration } from "../../utils/migrate.ts";

export const locatorDistanceUnit: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      distanceUnit: props.distanceUnit ?? "locale",
    }),
  },
};
