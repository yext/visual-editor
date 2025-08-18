import { Migration } from "../../utils/migrate.ts";

export const refactorContentBlocks: Migration = {
  Address: {
    action: "updated",
    propTransformation: ({ address, showGetDirections, ...props }) => {
      return {
        ...props,
        data: {
          address: address,
        },
        styles: {
          showGetDirections: showGetDirections,
          ctaVariant: "link",
        },
      };
    },
  },
  BodyText: {
    action: "updated",
    propTransformation: ({ text, variant, ...props }) => {
      return {
        ...props,
        data: {
          text: text,
        },
        styles: {
          variant: variant,
        },
      };
    },
  },
  Image: {
    action: "updated",
    propTransformation: ({ image, aspectRatio, width, ...props }) => {
      return {
        ...props,
        data: {
          image: image,
        },
        styles: {
          aspectRatio: aspectRatio,
          width: width,
        },
      };
    },
  },
  Phone: {
    action: "updated",
    propTransformation: ({ phone, format, includeHyperlink, ...props }) => {
      return {
        ...props,
        data: {
          phone: phone,
          label: {
            en: "Phone",
            hasLocalizedValue: "true",
          },
        },
        styles: {
          format: format || "domestic",
          includeHyperlink: includeHyperlink,
        },
      };
    },
  },
};
