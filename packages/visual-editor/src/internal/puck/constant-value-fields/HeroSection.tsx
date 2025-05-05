import { Field } from "@measured/puck";
import { CTA, ImageType } from "@yext/pages-components";

const ctaFields: Field<CTA> = {
  type: "object",
  objectFields: {
    label: {
      label: "Label",
      type: "text",
    },
    link: {
      label: "Link",
      type: "text",
    },
    linkType: {
      label: "Link Type",
      type: "select",
      options: [
        {
          label: "URL",
          value: "URL",
        },
        {
          label: "Email",
          value: "EMAIL",
        },
        {
          label: "Phone",
          value: "PHONE",
        },
        {
          label: "Click to Website",
          value: "CLICK_TO_WEBSITE",
        },
        {
          label: "Driving Directions",
          value: "DRIVING_DIRECTIONS",
        },
        {
          label: "Other",
          value: "OTHER",
        },
      ],
    },
  },
};

export const HERO_CONSTANT_CONFIG: Field<{
  image: ImageType;
  primaryCta: CTA;
  secondaryCta: CTA;
}> = {
  label: "",
  type: "object",
  objectFields: {
    image: {
      label: "Image",
      type: "object",
      objectFields: {
        url: {
          label: "URL",
          type: "text",
        },
      },
    } as Field<ImageType>,
    primaryCta: {
      label: "Primary CTA",
      ...ctaFields,
    },
    secondaryCta: {
      label: "Secondary CTA",
      ...ctaFields,
    },
  },
};
