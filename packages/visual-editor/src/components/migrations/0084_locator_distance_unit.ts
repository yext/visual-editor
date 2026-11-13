import { type Migration } from "../../utils/migrate.ts";

export const locatorDistanceUnit: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => ({
      ...props,
      defaultDistanceUnit: props.defaultDistanceUnit ?? "browserLanguage",
      showDistanceUnitToggle: props.showDistanceUnitToggle ?? false,
    }),
  },
};
