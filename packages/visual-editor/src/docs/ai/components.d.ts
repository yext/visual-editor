import {
  ImageType,
  CTA as CTA$1,
  LinkType,
  HoursTableProps as HoursTableProps$1,
  ComplexImageType,
  HoursType,
  AddressType,
  Coordinate,
  DayOfWeekNames,
} from "@yext/pages-components";
import { VariantProps } from "class-variance-authority";

interface PageSectionCategoryProps {
  BannerSection: BannerSectionProps;
  BreadcrumbsSection: BreadcrumbsSectionProps;
  CoreInfoSection: CoreInfoSectionProps;
  EventSection: EventSectionProps;
  FAQSection: FAQSectionProps;
  HeroSection: HeroSectionProps;
  InsightSection: InsightSectionProps;
  NearbyLocationsSection: NearbyLocationsSectionProps;
  PhotoGallerySection: PhotoGallerySectionProps;
  ProductSection: ProductSectionProps;
  PromoSection: PromoSectionProps;
  ReviewsSection: ReviewsSectionProps;
  StaticMapSection: StaticMapSectionProps;
  TeamSection: TeamSectionProps;
  TestimonialSection: TestimonialSectionProps;
  VideoSection: VideoSectionProps;
}

interface ExpandedHeaderProps {
  /**
   * This object contains all the content for both header tiers.
   * @propCategory Data Props
   */
  data: ExpandedHeaderData;
  /**
   * This object contains properties for customizing the appearance of both header tiers.
   * @propCategory Style Props
   */
  styles: ExpandedHeaderStyles;
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * Indicates which props should not be checked for missing translations.
   * @internal
   */
  ignoreLocaleWarning?: string[];
}

interface ExpandedFooterProps {
  /**
   * This object contains all the content for both footer tiers.
   * @propCategory Data Props
   */
  data: ExpandedFooterData;
  /**
   * This object contains properties for customizing the appearance of both footer tiers.
   * @propCategory Style Props
   */
  styles: ExpandedFooterStyles;
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * Indicates which props should not be checked for missing translations.
   * @internal
   */
  ignoreLocaleWarning?: string[];
}

interface BannerSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: BannerData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: BannerStyles;
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
  /**
   * Indicates which props should not be checked for missing translations.
   * @internal
   */
  ignoreLocaleWarning?: string[];
}

/**
 * @public Defines the complete set of properties for the BreadcrumbsSection component.
 */
interface BreadcrumbsSectionProps {
  /**
   * This object contains the content used by the component.
   * @propCategory Data Props
   */
  data: BreadcrumbsData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: BreadcrumbsStyles;
  /**
   * @internal
   */
  analytics: {
    scope?: string;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface CoreInfoSectionProps {
  /**
   * This object contains all the content to be displayed within the three columns.
   * @propCategory Data Props
   */
  data: CoreInfoData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: CoreInfoStyles;
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface EventSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: EventData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: EventStyles;
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface FAQSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: FAQData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: FAQStyles;
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface HeroSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: HeroData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: HeroStyles;
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility?: boolean;
}

interface InsightSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: InsightData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: InsightStyles;
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface NearbyLocationsSectionProps {
  /**
   * This object defines the search parameters for finding nearby locations.
   * @propCategory Data Props
   */
  data: NearbyLocationsData;
  /**
   * This object contains extensive properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: NearbyLocationsStyles;
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface PhotoGallerySectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: PhotoGalleryData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: PhotoGalleryStyles;
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface ProductSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: ProductData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: ProductStyles;
  /** @internal  */
  analytics: {
    scope?: string;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface PromoSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: PromoData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: PromoStyles;
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility?: boolean;
}

type ReviewsSectionProps = {
  backgroundColor: BackgroundStyle;
  analytics: {
    scope?: string;
  };
};

interface StaticMapSectionProps {
  /**
   * This object contains the configuration needed to generate the map.
   * @propCategory Data Props
   */
  data: StaticMapData;
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Styles Props
   */
  styles: StaticMapStyles;
}

interface TeamSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: TeamData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: TeamStyles;
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface TestimonialSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: TestimonialData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: TestimonialStyles;
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface VideoSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: VideoData;
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: VideoStyles;
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface ExpandedHeaderData {
  /** Content for the main primary header bar. */
  primaryHeader: {
    /** The main logo (top left) */
    logo: AssetImageType;
    /** The links to display in the primary header */
    links: TranslatableCTA[];
    /** Content for the first CTA (top right) */
    primaryCTA?: TranslatableCTA;
    /** Whether to show or hide the primary CTA */
    showPrimaryCTA: boolean;
    /** Content for the second CTA (top right) */
    secondaryCTA?: TranslatableCTA;
    /** Whether to show or hide the secondary CTA */
    showSecondaryCTA: boolean;
  };
  /** Content for the secondary header (above the main header). */
  secondaryHeader: {
    /** Whether to show or hide the secondary header */
    show: boolean;
    /** Whether to include the locale dropdown for multi-locale pages */
    showLanguageDropdown: boolean;
    /** The links to display in the secondary header */
    secondaryLinks: TranslatableCTA[];
  };
}

interface ExpandedHeaderStyles {
  /** Styling for the main, primary header bar. */
  primaryHeader: {
    logo: ImageStylingProps;
    backgroundColor?: BackgroundStyle;
    primaryCtaVariant: CTAVariant;
    secondaryCtaVariant: CTAVariant;
  };
  /** Styling for the secondary header (top bar). */
  secondaryHeader: {
    backgroundColor?: BackgroundStyle;
  };
  /** The maximum width of the header */
  maxWidth: PageSectionProps["maxWidth"];
  /** Whether the header is "sticky" or not */
  headerPosition: "sticky" | "fixed" | "scrollsWithPage";
}

interface ExpandedFooterData {
  /** Content for the primary footer bar. */
  primaryFooter: {
    logo: AssetImageType;
    facebookLink: string;
    instagramLink: string;
    linkedInLink: string;
    pinterestLink: string;
    tiktokLink: string;
    youtubeLink: string;
    xLink: string;
    /** Small images to show under the main logo */
    utilityImages: {
      image: AssetImageType;
      linkTarget?: string;
    }[];
    /**
     * Whether to expand the footer to show additional link categories.
     * expandedFooter: false uses a single row of footerLinks.
     * expandedFooter: true uses multiple columns of expandedFooterLinks.
     */
    expandedFooter: boolean;
    /** Links for the default footer */
    footerLinks: TranslatableCTA[];
    /** Links for the expanded footer */
    expandedFooterLinks: {
      label: TranslatableString;
      links: TranslatableCTA[];
    }[];
  };
  /** Content for the secondary header bar. */
  secondaryFooter: {
    /** Whether to hide or show the secondary footer */
    show: boolean;
    copyrightMessage: TranslatableString;
    secondaryFooterLinks: TranslatableCTA[];
  };
}

interface ExpandedFooterStyles {
  /** Styling for the primary footer bar. */
  primaryFooter: {
    backgroundColor?: BackgroundStyle;
    linksAlignment: "left" | "right";
    logo: ImageStylingProps;
    utilityImages: ImageStylingProps;
  };
  /** Styling for the secondary footer bar. */
  secondaryFooter: {
    backgroundColor?: BackgroundStyle;
    linksAlignment: "left" | "right";
  };
  /** The maximum width of the footer. */
  maxWidth: PageSectionProps["maxWidth"];
}

interface BannerData {
  /**
   * The rich text to display. It can be linked to a Yext entity field or set as a constant value.
   * @defaultValue "Banner Text" (constant)
   */
  text: YextEntityField<TranslatableRichText>;
}

interface BannerStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 6
   */
  backgroundColor?: BackgroundStyle;
  /**
   * The horizontal alignment of the text.
   * @defaultValue center
   */
  textAlignment: "left" | "right" | "center";
}

interface BreadcrumbsData {
  /**
   * The display label for the first link in the breadcrumb trail (the top-level directory page).
   * @defaultValue "Directory Root"
   */
  directoryRoot: TranslatableString;
}

interface BreadcrumbsStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
}

interface CoreInfoData {
  /** Content for the "Information" column. */
  info: {
    /** The heading at the top of the left column */
    headingText: YextEntityField<TranslatableString>;
    /** The address of the entity */
    address: YextEntityField<AddressType>;
    /** The phone number for the entity */
    phoneNumbers: Array<PhoneProps["data"]>;
    /** Emails associated with the entity */
    emails: YextEntityField<string[]>;
  };
  /** Content for the "Hours" column. */
  hours: {
    /** The heading at the top of the middle column */
    headingText: YextEntityField<TranslatableString>;
    /** The hours for the entity */
    hours: YextEntityField<HoursType>;
  };
  /** Content for the "Services" column. */
  services: {
    /** The heading at the top of the right column */
    headingText: YextEntityField<TranslatableString>;
    /** A text list, often of services the entity provides */
    servicesList: YextEntityField<TranslatableString[]>;
  };
}

interface CoreInfoStyles {
  /**
   * The background color of the section.
   * @defaultValue `Background Color 1`
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for all column headings. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
  /** Styling for the "Information" column. */
  info: AddressProps["styles"] &
    PhoneProps["styles"] & {
      emailsListLength?: number;
    };
  /** Styling for the "Hours" column. */
  hours: Omit<HoursTableProps["styles"], "alignment">;
}

interface EventData {
  /**
   * The main heading for the entire events section.
   * @defaultValue "Upcoming Events" (constant)
   */
  heading: YextEntityField<TranslatableString>;
  /**
   * The source of event data, which can be linked to a Yext field or provided as a constant value.
   * @defaultValue A list of 3 placeholder events.
   */
  events: YextEntityField<EventSectionType>;
}

interface EventStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for the heading. */
  heading: {
    /** The h tag level of the section heading */
    level: HeadingLevel;
    /** Alignment of the event section heading */
    align: "left" | "center" | "right";
  };
  /** Styling for all the cards. */
  cards: {
    /** The h tag level of each event card's title */
    headingLevel: HeadingLevel;
    /** The background color of each event card */
    backgroundColor?: BackgroundStyle;
    /** The CTA variant to use in each event card */
    ctaVariant: CTAVariant;
  };
}

interface FAQData {
  /**
   * The main heading for the entire events section.
   * @defaultValue "Frequently Asked Questions" (constant)
   */
  heading: YextEntityField<TranslatableString>;
  /**
   * The source of the FAQ data (questions and answers), which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder FAQs.
   */
  faqs: YextEntityField<FAQSectionType>;
}

interface FAQStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for the heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
}

interface HeroData {
  /**
   * The primary business name displayed in the hero.
   * @defaultValue "Business Name" (constant)
   */
  businessName: YextEntityField<TranslatableString>;
  /**
   * A location-based modifier or slogan (e.g., "Serving Downtown").
   * @defaultValue "Geomodifier" (constant)
   */
  localGeoModifier: YextEntityField<TranslatableString>;
  /**
   * The entity's hours data, used to display an "Open/Closed" status.
   * @defaultValue 'hours' field
   */
  hours: YextEntityField<HoursType>;
  /**
   * The main hero content, including an image and primary/secondary call-to-action buttons.
   * @defaultValue Placeholder image and CTAs
   */
  hero: YextStructEntityField<HeroSectionType>;
  /**
   * If 'true', displays the entity's average review rating.
   * @defaultValue true
   */
  showAverageReview: boolean;
}

interface HeroStyles {
  /**
   * The visual variant for the hero section.
   * @defaultValue classic
   */
  variant: "classic" | "immersive" | "spotlight" | "compact";
  /**
   * The background color for the entire section (classic and compact variants).
   * The background color for the featured content (spotlight variant).
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
  /**
   * The HTML heading level for the business name.
   * @defaultValue 3
   */
  businessNameLevel: HeadingLevel;
  /**
   * The HTML heading level for the local geo-modifier.
   * @defaultValue 1
   */
  localGeoModifierLevel: HeadingLevel;
  /**
   * The visual style variant for the primary call-to-action button.
   * @defaultValue primary
   */
  primaryCTA: CTAVariant;
  /**
   * The visual style variant for the secondary call-to-action button.
   * @defaultValue secondary
   */
  secondaryCTA: CTAVariant;
  /**
   * Styling options for the hero image.
   * Classic variant: aspect ratio (ratios 4:1, 3:1, 2:1, and 9:16 are not supported) and height.
   * Immersive variant: height (500px default, minimum height: content height + Page Section Top/Bottom Padding)
   * Spotlight variant: height (500px default, minimum height: content height + Page Section Top/Bottom Padding)
   * Compact variant: aspect ratio (ratios 4:1, 3:1, 2:1, and 9:16 are not supported).
   */
  image: ImageStylingProps & {
    height?: number;
  };
  /**
   * Container position on desktop (spotlight and immersive variants).
   * @defaultValue left
   */
  desktopContainerPosition?: "left" | "center";
  /**
   * Content alignment for mobile viewports.
   * @defaultValue left
   */
  mobileContentAlignment?: "left" | "center";
  /**
   * Whether to show the hero image (classic and compact variant).
   * @defaultValue true
   */
  showImage: boolean;
  /**
   * Positions the image to the left or right of the hero content on desktop (classic and compact variants).
   * @defaultValue right
   */
  desktopImagePosition: "left" | "right";
  /**
   * Positions the image to the top or bottom of the hero content on mobile (classic and compact variants).
   * @defaultValue top
   */
  mobileImagePosition: "bottom" | "top";
}

interface InsightData {
  /**
   * The main heading for the entire insights section.
   * @defaultValue "Insights"
   */
  heading: YextEntityField<TranslatableString>;
  /**
   * The source of the insight data, which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder insights.
   */
  insights: YextEntityField<InsightSectionType>;
}

interface InsightStyles {
  /**
   * The background color for the entire section, selected from the theme.
   * @defaultValue Background Color 2
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for the main section heading. */
  heading: {
    /** The h tag level of the section heading */
    level: HeadingLevel;
    /** Alignment of the insight section heading */
    align: "left" | "center" | "right";
  };
  /** Styling for the individual insight cards. */
  cards: {
    /** The h tag level of each insight card's title */
    headingLevel: HeadingLevel;
    /** The background color of each insight card */
    backgroundColor?: BackgroundStyle;
    /** The CTA variant to use in each insight card */
    ctaVariant: CTAVariant;
  };
}

interface NearbyLocationsData {
  /**
   * The main heading for the entire section.
   * @defaultValue "Nearby Locations" (constant)
   */
  heading: YextEntityField<TranslatableString>;
  /**
   * The central coordinate (`latitude`, `longitude`) to search from.
   * @defaultValue 'yextDisplayCoordinate' field
   */
  coordinate: YextEntityField<Coordinate>;
  /**
   * The search radius in miles.
   * @defaultValue 10
   */
  radius: number;
  /**
   * The maximum number of locations to find and display.
   * @defaultValue 3
   */
  limit: number;
}

interface NearbyLocationsStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
  /** Styling for the individual location cards. */
  cards: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
  };
  /**
   * The display format for phone numbers on the cards.
   * @defaultValue 'domestic'
   */
  phoneNumberFormat: "domestic" | "international";
  /**
   * If `true`, wraps phone numbers in a clickable `tel:` hyperlink.
   * @defaultValue false
   */
  phoneNumberLink: boolean;
  /** Styling for the hours display on each card. */
  hours: {
    /** Whether to display the current status ("Open Now" or "Closed") */
    showCurrentStatus: boolean;
    timeFormat?: "12h" | "24h";
    /** How to format the days of the week (short:Mon, long:Monday) */
    dayOfWeekFormat?: "short" | "long";
    /** Whether to include the day of the week */
    showDayNames?: boolean;
  };
}

interface PhotoGalleryData {
  /**
   * The main heading for the photo gallery.
   * @defaultValue "Gallery" (constant)
   */
  heading: YextEntityField<TranslatableString>;
  /**
   * The source of the image data, which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder images.
   */
  images: YextEntityField<
    | ImageType[]
    | ComplexImageType[]
    | {
        assetImage: AssetImageType;
      }[]
  >;
}

interface PhotoGalleryStyles {
  /**
   * The background color for the entire section, selected from the theme.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
  /** Styling options for the gallery images, such as aspect ratio. */
  image: ImageStylingProps;
}

interface ProductData {
  /**
   * The main heading for the entire products section.
   * @defaultValue "Featured Products" (constant)
   */
  heading: YextEntityField<TranslatableString>;
  /**
   * The source of the product data, which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder products.
   */
  products: YextEntityField<ProductSectionType>;
}

interface ProductStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 2
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
  /** Styling for the individual product cards. */
  cards: {
    /** The h tag level of each product card's title */
    headingLevel: HeadingLevel;
    /** The background color of each product card */
    backgroundColor?: BackgroundStyle;
    /** The CTA variant to use in each product card */
    ctaVariant: CTAVariant;
  };
}

interface PromoData {
  /**
   * The source for the promotional content, including an image, title, description, and a call-to-action.
   * @defaultValue Placeholder content for a featured promotion.
   */
  promo: YextStructEntityField<PromoSectionType>;
}

interface PromoStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
  /**
   * Positions the image to the left or right of the text content.
   * @defaultValue 'left'
   */
  orientation: "left" | "right";
  /**
   * The visual style variant for the call-to-action button.
   * @defaultValue 'primary'
   */
  ctaVariant: CTAVariant;
  /** Styling for the promo's title. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
  /**
   * Styling options for the promo image, such as aspect ratio.
   */
  image: ImageStylingProps;
}

/**
 * Applies a theme color as the background of a page section
 * @ai This value MUST be one of the following
 * { bgColor: "bg-white", textColor: "text-black" }
 * { bgColor: "bg-palette-primary-light", textColor: "text-black", isDarkBackground: false }
 * { bgColor: "bg-palette-secondary-light", textColor: "text-black", isDarkBackground: false }
 * { bgColor: "bg-palette-tertiary-light", textColor: "text-black", isDarkBackground: false }
 * { bgColor: "bg-palette-quaternary-light", textColor: "text-black", isDarkBackground: false }
 * { bgColor: "bg-palette-primary-dark", textColor: "text-white", isDarkBackground: true }
 * { bgColor: "bg-palette-secondary-dark", textColor: "text-white", isDarkBackground: true }
 */
type BackgroundStyle = {
  /** The tailwind background color class */
  bgColor: string;
  /** The tailwind text color class */
  textColor: string;
  /** Whether the background color is dark (for adjusting other styles based on background) */
  isDarkBackground?: boolean;
};

interface StaticMapData {
  /**
   * The API key used to generate the map image.
   * @defaultValue ""
   */
  apiKey: string;
}

interface StaticMapStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
}

interface TeamData {
  /**
   * The main heading for the entire team section.
   * @defaultValue "Meet Our Team" (constant)
   */
  heading: YextEntityField<TranslatableString>;
  /**
   * The source of the team member data, which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder people.
   */
  people: YextEntityField<TeamSectionType>;
}

interface TeamStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
  /** Styling for the individual people cards. */
  cards: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
    ctaVariant: CTAVariant;
  };
}

interface TestimonialData {
  /**
   * The main heading for the entire testimonials section.
   * @defaultValue "Featured Testimonials" (constant)
   */
  heading: YextEntityField<TranslatableString>;
  /**
   * The source of the testimonial data, which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder testimonials.
   */
  testimonials: YextEntityField<TestimonialSectionType>;
}

interface TestimonialStyles {
  /**
   * The background color for the entire section, selected from the theme.
   * @defaultValue Background Color 2
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
  /** Styling for the individual testimonial cards. */
  cards: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
  };
}

interface VideoData {
  /**
   * The main heading for the video section.
   * @defaultValue "" (constant)
   */
  heading: YextEntityField<TranslatableString>;
  /** The embedded YouTube video */
  assetVideo: AssetVideo | undefined;
}

interface VideoStyles {
  /**
   * The background color for the entire section, selected from the theme.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
}

type AssetImageType = Omit<ImageType, "alternateText"> & {
  alternateText?: TranslatableString;
  assetImage?: ImageContentData;
};

/**
 * A pages-components CTA with a translatable label and link
 */
type TranslatableCTA = Omit<CTA$1, "label" | "link"> & {
  /** The text to display in the CTA */
  label: TranslatableString;
  /** The link the for the CTA */
  link: TranslatableString;
};

/** Props for displaying an image */
interface ImageStylingProps {
  /** The aspect ratio of the image */
  aspectRatio: number;
  width?: number;
}

/**
 * The different visual variants for CTA buttons.
 * "primary": the default button style. A button filled with the primary theme color.
 * "secondary": an outlined button style. A button with a border in the primary theme color and transparent background.
 * "link": a text link style. A button with no border or background, just a hyperlink in the link theme color.
 * "directoryLink": a text link style optimized for directory listings.
 * "headerFooterMainLink": a text link style optimized for main links in the header and footer.
 * "headerFooterSecondaryLink": a text link style optimized for secondary links in the header and footer.
 */
type CTAVariant = ButtonProps["variant"];

interface PageSectionProps
  extends VariantProps<typeof maxWidthVariants>,
    React.HTMLAttributes<HTMLDivElement> {
  background?: BackgroundStyle;
  verticalPadding?: VariantProps<typeof pageSectionVariants>["verticalPadding"];
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
  outerClassName?: string;
  outerStyle?: React.CSSProperties;
}

/**
 * A string that can be translated for different locales.
 * @ai This should always be the LocalizedValues type
 */
type TranslatableString = string | LocalizedValues;

/** Represents data that can either be from the Yext Knowledge Graph or statically defined */
type YextEntityField<T> = {
  /** The api name of the Yext field */
  field: string;
  /** The static value of the field */
  constantValue: T;
  /** Whether to use the Yext field or the constant value */
  constantValueEnabled?: boolean;
  /**
   * Whether the field can be translated or not.
   * @ai always omit this property
   */
  disallowTranslation?: boolean;
  /**
   * Filter the embedded field input to this type.
   * @ai always omit this property
   */
  selectedType?: string;
};

/**
 * Rich text that can be translated for different locales.
 * @ai This should always be Record<string, RichText>
 */
type TranslatableRichText =
  | (string | RichText)
  | Record<string, string | RichText>;

/** The props for the Phone component */
interface PhoneProps {
  data: {
    /** The phone number data to display */
    number: YextEntityField<string>;
    /** The text to display before the phone number */
    label: TranslatableString;
  };
  styles: {
    /** Whether to format the phone number like a domestic or international number */
    phoneFormat: "domestic" | "international";
    /** Whether to make the phone number a clickable link */
    includePhoneHyperlink: boolean;
  };
}

/** Corresponds to the different semantic heading levels */
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Props for the Address component */
interface AddressProps {
  data: {
    /** The address data to display. */
    address: YextEntityField<AddressType>;
  };
  styles: {
    /** Includes a "Get Directions" CTA to Google Maps */
    showGetDirectionsLink: boolean;
    /** The variant of the get directions button */
    ctaVariant: CTAVariant;
  };
}

/** Props for the HoursTable component. */
interface HoursTableProps {
  data: {
    /** The hours data to display in the table. */
    hours: YextEntityField<HoursType>;
  };
  styles: {
    /**
     * The day of week to display at the top of the table.
     * If set to "today", the current day will dynamically be at the top.
     */
    startOfWeek: keyof DayOfWeekNames | "today";
    /** If true, consecutive days that have the same hours will be collapsed into one row. */
    collapseDays: boolean;
    /** Shows the showAdditionalHoursText subfield from the hours field, if present */
    showAdditionalHoursText: boolean;
    /** Alignment of the text in the hours table */
    alignment: "items-start" | "items-center";
  };
}

/** Data for the EventSection */
type EventSectionType = {
  events: Array<EventStruct>;
};

/** Data for the FAQSection */
type FAQSectionType = {
  faqs: Array<FAQStruct>;
};

/** Represents a Yext struct entity field (hero or promo) with support for static values and overrides. */
type YextStructEntityField<T extends Record<string, any> = any> = {
  /** The Yext Knowledge Graph field api name */
  field: string;
  /** The static value for the field */
  constantValue: T;
  /** Whether to use the static value instead of the entity field value */
  constantValueEnabled?: boolean;
  /** A map of subfield names to whether to use the static value for that subfield */
  constantValueOverride: {
    [K in keyof T]: boolean;
  };
};

/** Data for the HeroSection */
type HeroSectionType = {
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

/** Data for the InsightSection */
type InsightSectionType = {
  insights: Array<InsightStruct>;
};

/** Data for the ProductSection */
type ProductSectionType = {
  products: Array<ProductStruct>;
};

/** Data for the PromoSection */
type PromoSectionType = {
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

/** Data for the TeamSection */
type TeamSectionType = {
  people: Array<PersonStruct>;
};

/** Data for the TestimonialSection */
type TestimonialSectionType = {
  testimonials: Array<TestimonialStruct>;
};

type AssetVideo = {
  video: Video$1;
  /** Asset video description field */
  videoDescription?: string;
  /** Asset name (unique) */
  name: string;
  /** Asset internal id */
  id: string;
};

/** Describes the data corresponding to a piece of image content. */
type ImageContentData = {
  name?: string;
  transformedImage?: ImageData;
  originalImage?: ImageData;
  childImages?: ImageData[];
  transformations?: ImageTransformations;
  sourceUrl?: string;
  altText?: string;
};

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/** Represents a translatable string. The key is the locale (en, es, fr), and the value is the localized string. */
type LocalizedValues = {
  hasLocalizedValue: "true";
} & Record<string, string>;

/**
 * A rich text object with HTML and JSON (LexicalRichText) representations.
 * The HTML representation is used on the live page.
 * The JSON representation is used in the editor for rich text editing.
 */
type RichText = {
  html?: string;
  json?: string;
};

/** An individual event in the EventsSection */
type EventStruct = {
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

/** An individual FAQ */
type FAQStruct = {
  /** The question (always visible on the page) */
  question: TranslatableString;
  /** The answer (visible when the question is clicked) */
  answer: TranslatableRichText;
};

/** Enhanced CTA options */
type EnhancedTranslatableCTA = TranslatableCTA & {
  /**
   * The type of CTA button to display.
   * textAndLink is a standard button
   * getDirections is a button that opens a map based on the coordinate field
   * presetImage is uses a preset image such as app store or food delivery logos for the button
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

/** An individual insight for the InsightSection */
type InsightStruct = {
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

/** An individual product in the ProductSection */
type ProductStruct = {
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

/** An individual person in the TeamSection */
type PersonStruct = {
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

/** An individual testimonial for the TestimonialSection */
type TestimonialStruct = {
  /** The testimonial text */
  description?: TranslatableRichText;
  /** The name of the person who contributed the testimonial */
  contributorName?: TranslatableString;
  /** A UTC string for the contribution's date and time (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ) */
  contributionDate?: string;
};

type Video$1 = {
  /** The YouTube video URL */ url: string;
  /** The YouTube video ID */
  id: string;
  /** The YouTube video title */
  title: string;
  /** The YouTube video thumbnail URL */
  thumbnail: string;
  /** The YouTube video duration */
  duration: string;
  /** The embedded YouTube video URL (https://youtube.com/embed/<video_id>) */
  embeddedUrl: string;
};

/** Describes the data corresponding to a single image. */
type ImageData = {
  url: string;
  dimension?: ImageDimension;
  exifMetadata?: {
    rotate: number;
  };
};

type ImageTransformations = Partial<Record<TransformKind, ImageTransformation>>;

/** Preset image types for CTA buttons - app store or food deliver logos */
type PresetImageType =
  | "app-store"
  | "google-play"
  | "galaxy-store"
  | "app-gallery"
  | "uber-eats";

/** Describes the dimensions of an image. */
type ImageDimension = {
  width: number;
  height: number;
};

type TransformKind = "CROP" | "ROTATION";

/** Outlines the possible image transformations. */
type ImageTransformation = ImageRotation | ImageCrop;

/** Describes the data corresponding to an image rotation. */
type ImageRotation = {
  degree: number;
};

/** Describes the crop boundary box data */
type ImageCrop = {
  left: number;
  top: number;
  height: number;
  width: number;
  aspectRatio?: ImageAspectRatio;
};

/** Describes an image's aspect ratio. */
type ImageAspectRatio = {
  horizontalFactor: number;
  verticalFactor: number;
};
