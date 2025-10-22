import {
  Config,
  Data,
  DefaultComponentProps,
  DefaultRootProps,
  Field,
  ComponentConfig,
  CustomField,
  ArrayField,
  BaseField,
  ObjectField,
  NumberField,
  Fields,
  ComponentData,
  Slot,
} from "@measured/puck";
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
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: CoreInfoStyles;
  slots: {
    CoreInfoHeadingSlot: Slot;
    CoreInfoAddressSlot: Slot;
    CoreInfoPhoneNumbersSlot: Slot;
    CoreInfoEmailsSlot: Slot;
    HoursHeadingSlot: Slot;
    HoursTableSlot: Slot;
    ServicesHeadingSlot: Slot;
    ServicesListSlot: Slot;
  };
  /** @internal */
  conditionalRender?: {
    coreInfoCol?: boolean;
    hoursCol?: boolean;
    servicesCol?: boolean;
  };
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
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color of the section.
     * @defaultValue Background Color 3
     */
    backgroundColor?: BackgroundStyle;
  };
  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };
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
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: FAQStyles;
  slots: {
    HeadingSlot: Slot;
    FAQsWrapperSlot: Slot;
  };
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
  slots: {
    BusinessNameSlot: Slot;
    GeomodifierSlot: Slot;
    HoursStatusSlot: Slot;
    ImageSlot: Slot;
    PrimaryCTASlot: Slot;
    SecondaryCTASlot: Slot;
  };
  /** @internal */
  conditionalRender?: {
    hours: boolean;
  };
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
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color for the entire section.
     * @defaultValue Background Color 2
     */
    backgroundColor?: BackgroundStyle;
  };
  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };
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
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color for the entire section.
     * @defaultValue Background Color 2
     */
    backgroundColor?: BackgroundStyle;
  };
  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };
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
  slots: {
    HeadingSlot: Slot;
    DescriptionSlot: Slot;
    VideoSlot: Slot;
    ImageSlot: Slot;
    CTASlot: Slot;
  };
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
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color of the section.
     * @defaultValue Background Color 3
     */
    backgroundColor?: BackgroundStyle;
  };
  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };
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
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color of the section.
     * @defaultValue Background Color 2
     */
    backgroundColor?: BackgroundStyle;
  };
  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };
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

interface VideoSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color for the entire section, selected from the theme.
     * @defaultValue Background Color 1
     */
    backgroundColor?: BackgroundStyle;
  };
  slots: {
    SectionHeadingSlot: Slot;
    VideoSlot: Slot;
  };
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

interface CoreInfoStyles {
  /**
   * The background color of the section.
   * @defaultValue `Background Color 1`
   */
  backgroundColor?: BackgroundStyle;
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

interface FAQStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;
}

interface HeroData {
  backgroundImage: YextEntityField<ImageType | AssetImageType>;
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
   * If 'true', displays the entity's average review rating.
   * @defaultValue true
   */
  showAverageReview: boolean;
  /**
   * Whether to show the hero image (classic and compact variant).
   * @defaultValue true
   */
  showImage: boolean;
  /**
   * Image Height for the hero image with Immersive or Spotlight variant
   * Minimum height: content height + Page Section Top/Bottom Padding
   * @default 500px
   */
  imageHeight?: number;
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

interface PromoData {
  /**
   * The source for the promotional content, including an image, title, description, and a call-to-action.
   * @defaultValue Placeholder content for a featured promotion.
   */
  promo: YextEntityField<PromoSectionType | {}>;
  /**
   * Determines whether to display an image or video in the media section.
   * @defaultValue 'image'
   */
  media: "image" | "video";
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
}

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
  /**
   * The style of the map to be displayed.
   * @defaultValue Default (streets-v12)
   */
  mapStyle: string;
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
  selectedTypes?: string[];
};

/**
 * Rich text that can be translated for different locales.
 * @ai This should always be Record<string, RichText>
 */
type TranslatableRichText =
  | (string | RichText)
  | Record<string, string | RichText>;

/** Corresponds to the different semantic heading levels */
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

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

type AssetVideo = {
  video: Video$1;
  /** Asset video description field */
  videoDescription?: string;
  /** Asset name (unique) */
  name: string;
  /** Asset internal id */
  id: string;
};

/** Enhanced CTA options */
type EnhancedTranslatableCTA = TranslatableCTA & {
  /**
   * The type of CTA button to display.
   * textAndLink is a standard button
   * presetImage uses a preset image such as app store or food delivery logos for the button
   * @defaultValue "textAndLink"
   */
  ctaType?: CTADisplayType;
  selectedTypes?: string[];
  /**
   * A coordinate to use instead of a link for Get Directions CTAs.
   * If undefined, the link will be used.
   */
  latitude?: number;
  longitude?: number;
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

type Video$1 = {
  /** The YouTube video URL */
  url: string;
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

type CTADisplayType = "textAndLink" | "presetImage";

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
