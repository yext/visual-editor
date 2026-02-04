import {
  Field,
  ComponentConfig,
  Slot,
  Config,
  Data,
  DefaultComponentProps,
  DefaultRootProps,
  CustomField,
  ArrayField,
  BaseField,
  ObjectField,
  NumberField,
  Fields,
  ComponentData,
} from "@puckeditor/core";
import {
  B as BackgroundStyle,
  C as ComboboxOption,
  P as PresetImageType,
  T as TranslatableString,
  H as HeadingLevel,
  a as TranslatableRichText,
  E as EnhancedTranslatableCTA,
  b as TranslatableAssetImage,
  A as AssetVideo,
  c as ProductSectionType,
  d as ProductStruct,
  e as EventSectionType,
  f as EventStruct,
  I as InsightSectionType,
  g as InsightStruct,
  h as AssetImageType,
  F as FAQStruct,
  i as TeamSectionType,
  j as PersonStruct,
  k as TestimonialSectionType,
  l as TestimonialStruct,
  m as TranslatableCTA,
  R as RichText,
  n as PromoSectionType,
  o as FAQSectionType,
  p as ThemeConfig,
  q as TailwindConfig,
  r as ComboboxOptionGroup,
  M as MsgString,
  s as ThemeOptions,
} from "./tailwind-OYABrkaU.js";
import {
  LinkType,
  AddressType,
  HoursType,
  DayOfWeekNames,
  ImageType,
  ComplexImageType,
  HoursTableProps as HoursTableProps$1,
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
   * This object contains properties for customizing the component's data.
   * @propCategory Data Props
   */
  data: {
    showDetailsColumn: boolean;
  };
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
     * Whether to show the product image.
     * @defaultValue true
     */
    showImage?: boolean;
    /**
     * Whether to show the product brow text.
     * @defaultValue true
     */
    showBrow?: boolean;
    /**
     * Whether to show the product title.
     * @defaultValue true
     */
    showTitle?: boolean;
    /**
     * Whether to show the product price.
     * @defaultValue true
     */
    showPrice?: boolean;
    /**
     * Whether to show the product description.
     * @defaultValue true
     */
    showDescription?: boolean;
    /**
     * Whether to show the product CTA.
     * @defaultValue true
     */
    showCTA?: boolean;
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

interface FAQStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;
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
   * @default 500px
   */
  imageHeight: number;
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
