import { ImageType, CTA as CTAType } from "@yext/pages-components";

export type HeroSectionType = {
  image?: ImageType;
  primaryCta?: CTAType;
  secondaryCta?: CTAType;
};

export type PromoSectionType = {
  image?: ImageType;
  title?: TranslatableString;
  description?: TranslatableString;
  cta?: CTAType;
};

export type ProductSectionType = {
  products: Array<ProductStruct>;
};

export type ProductStruct = {
  image?: ImageType;
  name?: string;
  description?: RTF2 | string;
  category?: string;
  cta?: CTAType;
};

export type EventSectionType = {
  events: Array<EventStruct>;
};

export type EventStruct = {
  image?: ImageType;
  title?: string;
  dateTime?: string;
  description?: RTF2 | string;
  cta?: CTAType;
};

export type FAQSectionType = {
  faqs: Array<FAQStruct>;
};

export type FAQStruct = {
  question: string;
  answer: RTF2 | string;
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
  name?: string;
  category?: string;
  publishTime?: string;
  description?: RTF2 | string;
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

export type TranslatableString =
  | (string | RTF2)
  | Record<string, string | RTF2>;

export type RTF2 = {
  html?: string;
  json?: string;
};
