import { ImageType, CTA as CTAType } from "@yext/pages-components";

export type HeroSectionType = {
  image?: ImageType;
  primaryCta?: CTAType;
  secondaryCta?: CTAType;
};

export type PromoSectionType = {
  image?: ImageType;
  title?: string;
  description?: RTF2 | string;
  cta?: CTAType;
};

type RTF2 = {
  html?: string;
};
