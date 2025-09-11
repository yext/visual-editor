import { ImageType, CTA as CTAType } from "@yext/pages-components";
import { AssetImageType } from "./images";
import { AssetVideo } from "./videos";

/**
 * A pages-components CTA with a translatable label and link
 */
export type TranslatableCTA = Omit<CTAType, "label" | "link"> & {
  /** The text to display in the CTA */
  label: TranslatableString;
  /** The link the for the CTA */
  link: TranslatableString;
};

/** Enhanced CTA options */
export type EnhancedTranslatableCTA = TranslatableCTA & {
  /**
   * The type of CTA button to display.
   * textAndLink is a standard button
   * getDirections is a button that opens a map based on the coordinate field
   * presetImage uses a preset image such as app store or food delivery logos for the button
   * @defaultValue "textAndLink"
   * @ai If the CTA is for getting directions, use "getDirections" and provide the coordinate field.
   * If the CTA is for app downloads or food delivery, use "presetImage" and select the appropriate presetImageType. Otherwise, use "textAndLink".
   */
  ctaType?: "textAndLink" | "getDirections" | "presetImage";
  coordinate?: {
    latitude: number;
    longitude: number;
  };
  presetImageType?: PresetImageType;
};

/** Preset image types for CTA buttons - app store or food deliver logos */
export type PresetImageType =
  | "app-store"
  | "google-play"
  | "galaxy-store"
  | "app-gallery"
  | "uber-eats";

/** Data for the HeroSection */
export type HeroSectionType = {
  /**
   * The image to show in the hero section
   * @ai Always use ImageType
   */
  image?: ImageType | AssetImageType;
  /** The first CTA button for the hero section */
  primaryCta?: EnhancedTranslatableCTA;
  /** The second CTA button for the hero section */
  secondaryCta?: EnhancedTranslatableCTA;
};

/** Data for the PromoSection */
export type PromoSectionType = {
  /**
   * The image or video to show in the promo
   * @ai Always use ImageType
   */
  image?: ImageType | AssetImageType | AssetVideo;
  /** The main text to display in the promo */
  title?: TranslatableString;
  /** The sub text to display in the promo */
  description?: TranslatableRichText;
  /** The CTA button for the promo */
  cta: EnhancedTranslatableCTA;
};

/** Data for the ProductSection */
export type ProductSectionType = {
  products: Array<ProductStruct>;
};

/** An individual product in the ProductSection */
export type ProductStruct = {
  /**
   * The product's image
   * @ai Always use ImageType
   */
  image?: ImageType | AssetImageType;
  /** The product's name */
  name?: TranslatableString;
  /** The product's description */
  description?: TranslatableRichText;
  /**
   * The product's category
   * @ai This should not be more than a few words
   */
  category?: TranslatableString;
  /** The product's CTA */
  cta: EnhancedTranslatableCTA;
};

/** Data for the EventSection */
export type EventSectionType = {
  events: Array<EventStruct>;
};

/** An individual event in the EventsSection */
export type EventStruct = {
  /**
   * An image representing the event
   * @ai Always use ImageType
   */
  image?: ImageType | AssetImageType;
  /** The event's title */
  title?: TranslatableString;
  /** A UTC string for event's date and time (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ) */
  dateTime?: string;
  /** The event's description */
  description?: TranslatableRichText;
  /** The event's CTA */
  cta: EnhancedTranslatableCTA;
};

/** Data for the FAQSection */
export type FAQSectionType = {
  faqs: Array<FAQStruct>;
};

/** An individual FAQ */
export type FAQStruct = {
  /** The question (always visible on the page) */
  question: TranslatableString;
  /** The answer (visible when the question is clicked) */
  answer: TranslatableRichText;
};

/** Data for the TestimonialSection */
export type TestimonialSectionType = {
  testimonials: Array<TestimonialStruct>;
};

/** An individual testimonial for the TestimonialSection */
export type TestimonialStruct = {
  /** The testimonial text */
  description?: TranslatableRichText;
  /** The name of the person who contributed the testimonial */
  contributorName?: TranslatableString;
  /** A UTC string for the contribution's date and time (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ) */
  contributionDate?: string;
};

/** Data for the InsightSection */
export type InsightSectionType = {
  insights: Array<InsightStruct>;
};

/** An individual insight for the InsightSection */
export type InsightStruct = {
  /**
   * An image representing the insight
   * @ai Always use ImageType
   */
  image?: ImageType | AssetImageType;
  /** The insight's title */
  name?: TranslatableString;
  /**
   * The insight's category
   * @ai This should not be more than a few words
   */
  category?: TranslatableString;
  /** A UTC string for the insight's publish time (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ) */
  publishTime?: string;
  /** The insight's description */
  description?: TranslatableRichText;
  /** The insight's CTA */
  cta: EnhancedTranslatableCTA;
};

/** Data for the TeamSection */
export type TeamSectionType = {
  people: Array<PersonStruct>;
};

/** An individual person in the TeamSection */
export type PersonStruct = {
  /**
   * The person's headshot image
   * @ai Always use ImageType
   */
  headshot?: ImageType | AssetImageType;
  /** The person's name */
  name?: TranslatableString;
  /** The person's job title */
  title?: TranslatableString;
  /** The person's phone number. Format: +1234567890 */
  phoneNumber?: string;
  /** The person's email address */
  email?: string;
  /** A call to action for the person */
  cta: EnhancedTranslatableCTA;
};

/** Represents a translatable string. The key is the locale (en, es, fr), and the value is the localized string. */
type LocalizedValues = {
  hasLocalizedValue: "true";
} & Record<string, string>;

/**
 * A string that can be translated for different locales.
 * @ai This should always be the LocalizedValues type
 */
export type TranslatableString = string | LocalizedValues;

/**
 * Rich text that can be translated for different locales.
 * @ai This should always be Record<string, RichText>
 */
export type TranslatableRichText =
  | (string | RichText)
  | Record<string, string | RichText>;

/**
 * A rich text object with HTML and JSON (LexicalRichText) representations.
 * The HTML representation is used on the live page.
 * The JSON representation is used in the editor for rich text editing.
 */
export type RichText = {
  html?: string;
  json?: string;
};
