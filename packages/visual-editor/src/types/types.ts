import { ImageType, CTA as CTAType } from "@yext/pages-components";

export type HeroSectionType = {
  image?: ImageType;
  primaryCta?: CTAType;
  secondaryCta?: CTAType;
};

export type PromoSectionType = {
  image?: ImageType;
  title?: TranslatableString;
  description?: TranslatableRTF2;
  cta?: CTAType;
};

export type ProductSectionType = {
  products: Array<ProductStruct>;
};

export type ProductStruct = {
  image?: ImageType;
  name?: TranslatableString;
  description?: TranslatableRTF2;
  category?: TranslatableString;
  cta?: CTAType;
};

export type EventSectionType = {
  events: Array<EventStruct>;
};

export type EventStruct = {
  image?: ImageType;
  title?: TranslatableString;
  dateTime?: string;
  description?: TranslatableRTF2;
  cta?: CTAType;
};

export type FAQSectionType = {
  faqs: Array<FAQStruct>;
};

export type FAQStruct = {
  question: TranslatableString;
  answer: TranslatableRTF2;
};

export type TestimonialSectionType = {
  testimonials: Array<TestimonialStruct>;
};

export type TestimonialStruct = {
  description?: RTF2 | string;
  contributorName?: string;
  contributionDate?: string;
};

export type InsightSectionType = {
  insights: Array<InsightStruct>;
};

export type InsightStruct = {
  image?: ImageType;
  name?: TranslatableString;
  category?: TranslatableString;
  publishTime?: string;
  description?: TranslatableRTF2;
  cta?: CTAType;
};

export type TeamSectionType = {
  people: Array<PersonStruct>;
};

export type PersonStruct = {
  headshot?: ImageType;
  name?: string;
  title?: string;
  phoneNumber?: string;
  email?: string;
  cta?: CTAType;
};

export type TranslatableString = string | Record<string, string>;

export type TranslatableRTF2 = (string | RTF2) | Record<string, string | RTF2>;

export type RTF2 = {
  html?: string;
  json?: string;
};
