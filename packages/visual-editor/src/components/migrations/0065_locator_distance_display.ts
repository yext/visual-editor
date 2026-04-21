import { setDeep } from "@puckeditor/core";
import { LayoutMigration } from "../../utils/migrateLayout.ts";

const DEFAULT_DISTANCE_DISPLAY = "distanceFromUser";

export const locatorDistanceDisplay: LayoutMigration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      if (props.distanceDisplay !== undefined) {
        return props;
      }

      return setDeep(props, "distanceDisplay", DEFAULT_DISTANCE_DISPLAY);
    },
  },
};
