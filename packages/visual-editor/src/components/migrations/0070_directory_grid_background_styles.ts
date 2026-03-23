import { Migration } from "../../utils/migrate.ts";
import { backgroundColors } from "../../utils/themeConfigOptions.ts";

const transformDirectoryGridProps = (
  oldProps: { id: string } & Record<string, any>
) => {
  if (oldProps.styles?.backgroundColor) {
    return oldProps;
  }

  return {
    ...oldProps,
    styles: {
      ...oldProps.styles,
      backgroundColor:
        oldProps.backgroundColor ?? backgroundColors.background1.value,
    },
  };
};

export const directoryGridBackgroundStyles: Migration = {
  DirectoryGrid: {
    action: "updated",
    propTransformation: transformDirectoryGridProps,
  },
};
