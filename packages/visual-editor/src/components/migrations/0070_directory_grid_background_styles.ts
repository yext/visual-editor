import { LayoutMigration } from "../../utils/migrateLayout.ts";
import { backgroundColors } from "../../utils/themeConfigOptions.ts";

const setDefaultDirectoryGridBackgroundColor = (
  oldProps: { id: string } & Record<string, any>
) => {
  if (oldProps.styles?.backgroundColor) {
    return oldProps;
  }

  return {
    ...oldProps,
    styles: {
      ...oldProps.styles,
      backgroundColor: backgroundColors.background1.value,
    },
  };
};

const setDefaultDirectoryListBackgroundColor = (
  oldProps: { id: string } & Record<string, any>
) => {
  if (oldProps.styles?.listBackgroundColor) {
    return oldProps;
  }

  return {
    ...oldProps,
    styles: {
      ...oldProps.styles,
      listBackgroundColor: backgroundColors.background1.value,
    },
  };
};

export const directoryGridBackgroundStyles: LayoutMigration = {
  DirectoryGrid: {
    action: "updated",
    propTransformation: setDefaultDirectoryGridBackgroundColor,
  },
  Directory: {
    action: "updated",
    propTransformation: setDefaultDirectoryListBackgroundColor,
  },
};
