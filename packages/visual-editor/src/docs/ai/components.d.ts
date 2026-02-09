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
} from "@puckeditor/core";
import {
  ImageType,
  CTA as CTA$1,
  LinkType,
  HoursTableProps as HoursTableProps$1,
  ComplexImageType,
  HoursType,
  AddressType,
  DayOfWeekNames,
  Coordinate,
  ListingType,
} from "@yext/pages-components";
import { VariantProps } from "class-variance-authority";

interface PageSectionCategoryProps {
  AboutSection: AboutSectionProps;
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
  ProfessionalHeroSection: ProfessionalHeroSectionProps;
  PromoSection: PromoSectionProps;
  ReviewsSection: ReviewsSectionProps;
  StaticMapSection: StaticMapSectionProps;
  TeamSection: TeamSectionProps;
  TestimonialSection: TestimonialSectionProps;
  VideoSection: VideoSectionProps;
}

interface ExpandedHeaderProps {
  /**
   * This object contains properties for customizing the appearance of both header tiers.
   * @propCategory Style Props
   */
  styles: ExpandedHeaderStyles;
  /** @internal */
  slots: {
    PrimaryHeaderSlot: Slot;
    SecondaryHeaderSlot: Slot;
  };
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
  slots: {
    LogoSlot: Slot;
    SocialLinksSlot: Slot;
    UtilityImagesSlot: Slot;
    PrimaryLinksWrapperSlot: Slot;
    ExpandedLinksWrapperSlot: Slot;
    SecondaryFooterSlot: Slot;
  };
  /** @internal */
  analytics: {
    scope?: string;
  };
  /**
   * Indicates which props should not be checked for missing translations.
   * @internal */
  ignoreLocaleWarning?: string[];
}

type AboutSectionProps = {
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
    /**
     * If 'true', the sidebar with additional details is shown; if 'false', it's hidden.
     * @defaultValue true
     */
    showDetailsColumn: boolean;
  };
  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
    DescriptionSlot: Slot;
    SidebarSlot: Slot;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
};

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
    TextListSlot: Slot;
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
    /**
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
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
  data: Omit<YextEntityField<FAQSectionType>, "constantValue"> & {
    constantValue: {
      id?: string;
    }[];
  };
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: FAQStyles;
  slots: {
    HeadingSlot: Slot;
    CardSlot: Slot;
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
    /**
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
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
   * This object contains extensive properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color for the entire section.
     * @defaultValue Background Color 1
     */
    backgroundColor?: BackgroundStyle;
    /**
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
  };
  /** @internal */
  analytics: {
    scope?: string;
  };
  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

interface PhotoGallerySectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: PhotoGalleryStyles;
  /** @internal */
  slots: {
    HeadingSlot: Slot;
    PhotoGalleryWrapper: Slot;
  };
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
    /**
     * The variant of the product cards.
     * @defaultValue Immersive
     */
    cardVariant?: ProductSectionVariant;
    /**
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
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

interface ProfessionalHeroSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: ProfessionalHeroStyles;
  /** @internal */
  slots: {
    ImageSlot: Slot;
    BusinessNameSlot: Slot;
    CredentialsSlot: Slot;
    ProfessionalNameSlot: Slot;
    ProfessionalTitleSlot: Slot;
    SubtitleSlot: Slot;
    AddressSlot: Slot;
    PrimaryCTASlot: Slot;
    SecondaryCTASlot: Slot;
    PhoneSlot: Slot;
    EmailSlot: Slot;
  };
  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility?: boolean;
  /** @internal */
  conditionalRender?: {
    isRightColumnVisible?: boolean;
  };
  /** @internal */
  analytics: {
    scope?: string;
  };
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

interface ReviewsSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color of the section.
     * @defaultValue Background Color 1
     */
    backgroundColor?: BackgroundStyle;
    /**
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
  };
  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
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
    /**
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
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
    /**
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
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

interface ExpandedHeaderStyles {
  /** The maximum width of the header */
  maxWidth: PageSectionProps["maxWidth"];
  /** Whether the header is fixed to the top of the page or not */
  headerPosition: "fixed" | "scrollsWithPage";
}

interface ExpandedFooterData {
  /** Content for the primary footer bar. */
  primaryFooter: {
    /**
     * Whether to expand the footer to show additional link categories.
     * expandedFooter: false uses a single row of footerLinks.
     * expandedFooter: true uses multiple columns of expandedFooterLinks.
     */
    expandedFooter: boolean;
  };
}

interface ExpandedFooterStyles {
  /** Styling for the primary footer bar. */
  primaryFooter: {
    backgroundColor?: BackgroundStyle;
    linksPosition: "left" | "right";
  };
  /** The maximum width of the footer. */
  maxWidth: PageSectionProps["maxWidth"];
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

/** Data for the FAQSection */
type FAQSectionType = {
  faqs: Array<FAQStruct>;
};

interface FAQStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;
  /**
   * Whether to show the section heading.
   * @defaultValue true
   */
  showSectionHeading: boolean;
}

interface HeroData {
  backgroundImage: YextEntityField<
    ImageType | AssetImageType | TranslatableAssetImage
  >;
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
   * Image Height for the hero image with Immersive or Spotlight variant
   * Minimum height: content height + Page Section Top/Bottom Padding
   * @defaultValue 500px
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
  /**
   * Whether to show the business name.
   * @defaultValue true
   */
  showBusinessName: boolean;
  /**
   * Whether to show the geomodifier.
   * @defaultValue true
   */
  showGeomodifier: boolean;
  /**
   * Whether to show the hours status.
   * @defaultValue true
   */
  showHoursStatus: boolean;
  /**
   * If 'true', displays the entity's average review rating.
   * @defaultValue true
   */
  showAverageReview: boolean;
  /**
   * Whether to show the primary CTA.
   * @defaultValue true
   */
  showPrimaryCTA: boolean;
  /**
   * Whether to show the secondary CTA.
   * @defaultValue true
   */
  showSecondaryCTA: boolean;
  /**
   * Whether to show the hero image (classic and compact variant).
   * @defaultValue true
   */
  showImage: boolean;
}

interface PhotoGalleryStyles {
  /**
   * The background color for the entire section, selected from the theme.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
  /**
   * The layout style for displaying images in the gallery.
   * @defaultValue "gallery"
   */
  variant: "gallery" | "carousel";
  /**
   * Whether to show the section heading
   * @defaultValue true
   */
  showSectionHeading: boolean;
}

type ProductSectionVariant = "immersive" | "classic" | "minimal";

interface ProfessionalHeroStyles {
  /**
   * The background color for the section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
  /**
   * If 'true', displays the entity's average review rating.
   * @defaultValue true
   */
  showAverageReview: boolean;
  /**
   * Whether to show the hero image.
   * @defaultValue true
   */
  showImage: boolean;
  /**
   * Positions the image to the left or right of the hero content on desktop.
   * @defaultValue left
   */
  desktopImagePosition: "left" | "right";
  /**
   * Positions the image to the top or bottom of the hero content on mobile.
   * @defaultValue top
   */
  mobileImagePosition: "bottom" | "top";
  /**
   * Whether to show the credentials slot.
   * @defaultValue true
   */
  showCredentials?: boolean;
  /**
   * Whether to show the subtitle slot.
   * @defaultValue true
   */
  showSubtitle?: boolean;
  /**
   * Whether to show the business name slot.
   * @defaultValue true
   */
  showBusinessName?: boolean;
  /**
   * Whether to show the professional title slot.
   * @defaultValue true
   */
  showProfessionalTitle?: boolean;
  /**
   * Whether to show the address slot.
   * @defaultValue true
   */
  showAddress?: boolean;
  /**
   * Whether to show the primary CTA slot.
   * @defaultValue true
   */
  showPrimaryCTA?: boolean;
  /**
   * Whether to show the secondary CTA slot.
   * @defaultValue true
   */
  showSecondaryCTA?: boolean;
  /**
   * Whether to show the phone slot.
   * @defaultValue true
   */
  showPhone?: boolean;
  /**
   * Whether to show the email slot.
   * @defaultValue true
   */
  showEmail?: boolean;
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
  /**
   * The background image used by the immersive and spotlight variants.
   * @defaultValue Placeholder image.
   */
  backgroundImage: YextEntityField<
    ImageType | AssetImageType | TranslatableAssetImage
  >;
}

interface PromoStyles {
  /**
   * The visual variant for the promo section.
   * @defaultValue classic
   */
  variant: "classic" | "immersive" | "spotlight" | "compact";
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;
  /**
   * Positions the media to the left or right of the promo content on desktop (classic and compact variants).
   * @defaultValue right
   */
  desktopImagePosition: "left" | "right";
  /**
   * Positions the media to the top or bottom of the promo content on mobile (classic and compact variants).
   * @defaultValue top
   */
  mobileImagePosition: "top" | "bottom";
  /**
   * Text content position and alignment.
   * @defaultValue left
   */
  containerAlignment: "left" | "center" | "right";
  /**
   * Image Height for the promo image with Immersive or Spotlight variant
   * Minimum height: content height + Page Section Top/Bottom Padding
   * @defaultValue 500px
   */
  imageHeight: number;
  /**
   * Whether to show the media content, either image or video.
   * @defaultValue true
   */
  showMedia: boolean;
  /**
   * Whether to show the heading text.
   * @defaultValue true
   */
  showHeading: boolean;
  /**
   * Whether to show the description text.
   * @defaultValue true
   */
  showDescription: boolean;
  /**
   * Whether to show the CTA.
   * @defaultValue true
   */
  showCTA: boolean;
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
 * Rich text that can be translated for different locales.
 * @ai This should always be Record<string, RichText>
 */
type TranslatableRichText =
  | (string | RichText)
  | Record<string, string | RichText>;

/**
 * A string that can be translated for different locales.
 * @ai This should always be the LocalizedValues type
 */
type TranslatableString = string | LocalizedValues;

/** An individual FAQ */
type FAQStruct = {
  /** The question (always visible on the page) */
  question: TranslatableString | TranslatableRichText;
  /** The answer (visible when the question is clicked) */
  answer: TranslatableRichText;
};

type AssetImageType = Omit<ImageType, "alternateText"> & {
  alternateText?: TranslatableString;
  assetImage?: ImageContentData;
};

type TranslatableAssetImage = AssetImageType | LocalizedAssetImage;

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

/**
 * A rich text object with HTML and JSON (LexicalRichText) representations.
 * The HTML representation is used on the live page.
 * The JSON representation is used in the editor for rich text editing.
 */
type RichText = {
  html?: string;
  json?: string;
};

/** Represents a translatable string. The key is the locale (en, es, fr), and the value is the localized string. */
type LocalizedValues = {
  hasLocalizedValue: "true";
} & Record<string, string>;

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

type LocalizedAssetImage = {
  hasLocalizedValue: "true";
} & {
  [key: string]: AssetImageType | undefined;
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
   * getDirections is a button that opens a map based on the coordinate field
   * presetImage uses a preset image such as app store or food delivery logos for the button
   * @defaultValue "textAndLink"
   */
  ctaType?: "textAndLink" | "getDirections" | "presetImage";
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

/**
 * A pages-components CTA with a translatable label and link
 */
type TranslatableCTA = Omit<CTA$1, "label" | "link"> & {
  /** The text to display in the CTA */
  label: TranslatableString;
  /** The link the for the CTA */
  link: TranslatableString;
  openInNewTab?: boolean;
};

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
