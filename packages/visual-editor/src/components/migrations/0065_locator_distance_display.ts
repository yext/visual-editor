import { setDeep } from "@puckeditor/core";
import { Migration } from "../../utils/migrate.ts";

const DEFAULT_DISTANCE_DISPLAY = "distanceFromUser";

export const locatorDistanceDisplay: Migration = {
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
