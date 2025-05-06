import { Field } from "@measured/puck";
import { CTA, ImageType } from "@yext/pages-components";
import { ctaFields } from "./CallToAction.tsx";

export const PROMO_CONSTANT_CONFIG: Field<{
  image: ImageType;
  title: string;
  description: string;
  cta: CTA;
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
    title: {
      label: "Title",
      type: "text",
    },
    description: {
      label: "Description",
      type: "textarea",
    },
    cta: {
      label: "CTA",
      ...ctaFields,
    },
  },
};
