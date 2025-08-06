import { Migration } from "../../utils/migrate.ts";

export const ignoreLocaleWarningBannerSection: Migration = {
  BannerSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        ignoreLocaleWarning: ["data.text"],
      };
    },
  },
  // ExpandedHeader and ExpandedFooter are not needed because
  // their resolveData functions are automatically run when Puck renders.
};
