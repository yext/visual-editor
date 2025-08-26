import { ImageType, CTA as CTAType } from "@yext/pages-components";
import { AssetImageType } from "./images";

// A copy of CTAType that changes label from string to TranslatableString
export type TranslatableCTA = Omit<CTAType, "label" | "link"> & {
  label: TranslatableString;
  link: TranslatableString;
};

// Enhanced CTA type with new options
export type EnhancedTranslatableCTA = TranslatableCTA & {
  ctaType?: "textAndLink" | "getDirections" | "presetImage";
  coordinate?: {
    latitude: number;
    longitude: number;
  };
  presetImageType?: PresetImageType;
};

// Preset image types for CTA buttons - Mobile app store buttons and Food delivery
export type PresetImageType =
  | "app-store"
  | "google-play"
  | "galaxy-store"
  | "app-gallery"
  | "uber-eats";

export type HeroSectionType = {
  image?: ImageType | AssetImageType;
  primaryCta?: EnhancedTranslatableCTA;
  secondaryCta?: EnhancedTranslatableCTA;
};

export type PromoSectionType = {
  image?: ImageType | AssetImageType;
  title?: TranslatableString;
  description?: TranslatableRichText;
  cta: EnhancedTranslatableCTA;
};

export type ProductSectionType = {
  products: Array<ProductStruct>;
};

export type ProductStruct = {
  image?: ImageType | AssetImageType;
  name?: TranslatableString;
  description?: TranslatableRichText;
  category?: TranslatableString;
  cta: EnhancedTranslatableCTA;
};

export type EventSectionType = {
  events: Array<EventStruct>;
};

export type EventStruct = {
  image?: ImageType | AssetImageType;
  title?: TranslatableString;
  dateTime?: string;
  description?: TranslatableRichText;
  cta: EnhancedTranslatableCTA;
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
  image?: ImageType | AssetImageType;
  name?: TranslatableString;
  category?: TranslatableString;
  publishTime?: string;
  description?: TranslatableRichText;
  cta: EnhancedTranslatableCTA;
};

export type TeamSectionType = {
  people: Array<PersonStruct>;
};

export type PersonStruct = {
  headshot?: ImageType | AssetImageType;
  name?: TranslatableString;
  title?: TranslatableString;
  phoneNumber?: string;
  email?: string;
  cta: EnhancedTranslatableCTA;
};

type LocalizedValues = {
  hasLocalizedValue: "true";
} & Record<string, string>;

export type TranslatableString = string | LocalizedValues;

export type TranslatableRichText =
  | (string | RichText)
  | Record<string, string | RichText>;

export type RichText = {
  html?: string;
  json?: string;
};
