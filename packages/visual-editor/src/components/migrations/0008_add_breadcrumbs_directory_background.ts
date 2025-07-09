import { Migration } from "../../utils/migrate.ts";
import { backgroundColors } from "../../utils/themeConfigOptions.ts";

export const addBreadcrumbsDirectoryBackgroundMigration: Migration = {
  // Update Breadcrumbs - add backgroundColor
  Breadcrumbs: {
    action: "updated",
    propTransformation: ({ ...props }) => ({
      ...props,
      styles: {
        backgroundColor: backgroundColors.background1.value,
      },
    }),
  },

  // Update Directory - add backgroundColor and breadcrumbsBackgroundColor
  Directory: {
    action: "updated",
    propTransformation: ({ ...props }) => ({
      ...props,
      styles: {
        backgroundColor: backgroundColors.background1.value,
        breadcrumbsBackgroundColor: backgroundColors.background1.value,
      },
    }),
  },
};
