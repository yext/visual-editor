import { Migration } from "../../utils/migrate.ts";

const updateHeadingStructure = (oldProps: any) => {
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

export const addHeadingAlignmentMigration: Migration = {
  ProductSection: {
    action: "updated",
    propTransformation: updateHeadingStructure,
  },
  EventSection: {
    action: "updated",
    propTransformation: updateHeadingStructure,
  },
  FAQSection: {
    action: "updated",
    propTransformation: updateHeadingStructure,
  },
  PhotoGallerySection: {
    action: "updated",
    propTransformation: updateHeadingStructure,
  },
  TeamSection: {
    action: "updated",
    propTransformation: updateHeadingStructure,
  },
  InsightSection: {
    action: "updated",
    propTransformation: updateHeadingStructure,
  },
  CoreInfoSection: {
    action: "updated",
    propTransformation: updateHeadingStructure,
  },
  NearbyLocationsSection: {
    action: "updated",
    propTransformation: updateHeadingStructure,
  },
};
