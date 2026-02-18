import { setDeep } from "@puckeditor/core";
import { Migration } from "../../utils/migrate.ts";

const DEFAULT_PRIMARY_CTA_LABEL = "Visit Page";

export const addLocatorPrimaryCtaLabel: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      const existingLabel = props?.resultCard?.primaryCTA?.label;
      if (existingLabel !== undefined) {
        return props;
      }

      return setDeep(
        props,
        "resultCard.primaryCTA.label",
        DEFAULT_PRIMARY_CTA_LABEL
      );
    },
  },
};
