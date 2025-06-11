import { Migration } from "../../utils/migrate.ts";

export const addHeadingAlignmentMigration: Migration = {
  ProductSection: {
    action: "updated",
    propTransformation: (oldProps) => ({
      ...oldProps,
      styles: {
        ...oldProps.styles,
        headingAlign: "left",
      },
    }),
  },
  EventSection: {
    action: "updated",
    propTransformation: (oldProps) => ({
      ...oldProps,
      styles: {
        ...oldProps.styles,
        headingAlign: "left",
      },
    }),
  },
  FAQSection: {
    action: "updated",
    propTransformation: (oldProps) => ({
      ...oldProps,
      styles: {
        ...oldProps.styles,
        headingAlign: "left",
      },
    }),
  },
  PhotoGallerySection: {
    action: "updated",
    propTransformation: (oldProps) => ({
      ...oldProps,
      styles: {
        ...oldProps.styles,
        headingAlign: "left",
      },
    }),
  },
  TeamSection: {
    action: "updated",
    propTransformation: (oldProps) => ({
      ...oldProps,
      styles: {
        ...oldProps.styles,
        headingAlign: "left",
      },
    }),
  },
  InsightSection: {
    action: "updated",
    propTransformation: (oldProps) => ({
      ...oldProps,
      styles: {
        ...oldProps.styles,
        headingAlign: "left",
      },
    }),
  },
  CoreInfoSection: {
    action: "updated",
    propTransformation: (oldProps) => ({
      ...oldProps,
      styles: {
        ...oldProps.styles,
        headingAlign: "left",
      },
    }),
  },
};
