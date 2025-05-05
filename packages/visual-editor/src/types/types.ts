import { ImageType, CTA as CTAType } from "@yext/pages-components";

export type HeroSection = {
  image?: ImageType;
  primaryCta?: CTAType;
  secondaryCta?: CTAType;
};
