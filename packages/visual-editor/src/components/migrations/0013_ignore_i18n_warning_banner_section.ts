import { Migration } from "../../utils/migrate.ts";

export const ignore18nWarningBannerSection: Migration = {
  BannerSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        ignore18nWarning: ["data.text"],
      };
    },
  },
  // ExpandedHeader and ExpandedFooter are not needed because
  // their resolveData functions are automatically run when Puck renders.
};
