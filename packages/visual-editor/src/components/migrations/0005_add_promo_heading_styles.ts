import { Migration } from "../../utils/migrate.ts";

const updatePromoHeadingStructure = (oldProps: any) => {
  if (!oldProps?.styles) {
    return {
      ...oldProps,
      styles: {
        heading: {
          level: 2,
          align: "left",
        },
      },
    };
  }

  const { headingLevel, headingAlign, ...restStyles } = oldProps.styles;
  return {
    ...oldProps,
    styles: {
      ...restStyles,
      heading: {
        level: headingLevel ?? 2,
        align: headingAlign ?? "left",
      },
    },
  };
};

export const addPromoHeadingStylesMigration: Migration = {
  PromoSection: {
    action: "updated",
    propTransformation: updatePromoHeadingStructure,
  },
};
