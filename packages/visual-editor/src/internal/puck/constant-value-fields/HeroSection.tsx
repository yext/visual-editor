import { Field } from "@measured/puck";
import { CTA, ImageType } from "@yext/pages-components";
import { ctaFields } from "./CallToAction.tsx";

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
