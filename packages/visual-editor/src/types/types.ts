import { ImageType, CTA as CTAType } from "@yext/pages-components";

// A copy of CTAType that changes label from string to TranslatableString
export type TranslatableCTA = Omit<CTAType, "label"> & {
  label: TranslatableString;
};

export type HeroSectionType = {
  image?: ImageType;
  primaryCta?: TranslatableCTA;
  secondaryCta?: TranslatableCTA;
};

export type PromoSectionType = {
  image?: ImageType;
  title?: TranslatableString;
  description?: TranslatableRichText;
  cta?: TranslatableCTA;
};

export type ProductSectionType = {
  products: Array<ProductStruct>;
};

export type ProductStruct = {
  image?: ImageType;
  name?: TranslatableString;
  description?: TranslatableRichText;
  category?: TranslatableString;
  cta?: TranslatableCTA;
};

export type EventSectionType = {
  events: Array<EventStruct>;
};

export type EventStruct = {
  image?: ImageType;
  title?: TranslatableString;
  dateTime?: string;
  description?: TranslatableRichText;
  cta?: TranslatableCTA;
};

export type FAQSectionType = {
  faqs: Array<FAQStruct>;
};

export type FAQStruct = {
  question: TranslatableString;
  answer: TranslatableRichText;
};

export type TestimonialSectionType = {
  testimonials: Array<TestimonialStruct>;
};

export type TestimonialStruct = {
  description?: TranslatableRichText;
  contributorName?: TranslatableString;
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
  description?: TranslatableRichText;
  cta?: TranslatableCTA;
};

export type TeamSectionType = {
  people: Array<PersonStruct>;
};

export type PersonStruct = {
  headshot?: ImageType;
  name?: TranslatableString;
  title?: TranslatableString;
  phoneNumber?: string;
  email?: string;
  cta?: TranslatableCTA;
};

export type TranslatableString = string | Record<string, string>;

export type TranslatableRichText =
  | (string | RichText)
  | Record<string, string | RichText>;

export type RichText = {
  html?: string;
  json?: string;
};
