import { DropZone, type Config } from "@measured/puck";
import "@yext/visual-editor/style.css";
import "./index.css";
import {
  Address,
  AddressProps,
  Banner,
  BannerProps,
  BodyText,
  BodyTextProps,
  Card,
  CardProps,
  CTAWrapper as CTA,
  CTAWrapperProps,
  Emails,
  EmailsProps,
  Flex,
  FlexProps,
  GetDirections,
  GetDirectionsProps,
  Grid,
  GridProps,
  HeadingText,
  HeadingTextProps,
  HoursTable,
  HoursTableProps,
  HoursStatus,
  HoursStatusProps,
  ImageWrapper,
  ImageWrapperProps,
  Phone,
  PhoneProps,
  TextList,
  TextListProps,
  Header,
  HeaderProps,
  Footer,
  FooterProps,
  Breadcrumbs,
  BreadcrumbsProps,
  Directory,
  DirectoryProps,
  Promo,
  PromoProps,
  MapboxStaticMap,
  MapboxStaticProps,
  CollectionSection,
  CollectionSectionProps,
  ExampleRepeatableItemComponent,
  ExampleRepeatableItemProps,
  Testimonials,
  TestimonialsProps,
  NearbyLocations,
  NearbyLocationsProps,
  PersonCard,
  PersonCardProps,
  FAQsSection,
  FAQsSectionProps,
  Events,
  EventsProps,
  HeroSectionProps,
  HeroSection,
  PhotoGallerySectionProps,
  PhotoGallerySection,
  CoreInfoSectionProps,
  CoreInfoSection,
  InsightsSection,
  InsightsSectionProps,
  ProductCard,
  ProductCardProps,
} from "@yext/visual-editor";

type MainProps = {
  Address: AddressProps;
  Banner: BannerProps;
  BodyText: BodyTextProps;
  Breadcrumbs: BreadcrumbsProps;
  Card: CardProps;
  CTA: CTAWrapperProps;
  Directory: DirectoryProps;
  Emails: EmailsProps;
  FAQsSection: FAQsSectionProps;
  Flex: FlexProps;
  Footer: FooterProps;
  GetDirections: GetDirectionsProps;
  Grid: GridProps;
  Header: HeaderProps;
  HeadingText: HeadingTextProps;
  HoursTable: HoursTableProps;
  HoursStatus: HoursStatusProps;
  ImageWrapper: ImageWrapperProps;
  MapboxStaticMap: MapboxStaticProps;
  Phone: PhoneProps;
  Promo: PromoProps;
  TextList: TextListProps;
  ExampleRepeatableItemComponent: ExampleRepeatableItemProps;
  CollectionSection: CollectionSectionProps;
  Testimonials: TestimonialsProps;
  NearbyLocations: NearbyLocationsProps;
  PersonCard: PersonCardProps;
  Events: EventsProps;
  HeroSection: HeroSectionProps;
  PhotoGallerySection: PhotoGallerySectionProps;
  CoreInfoSection: CoreInfoSectionProps;
  InsightsSection: InsightsSectionProps;
  ProductCard: ProductCardProps;
};

const components: Config<MainProps>["components"] = {
  Banner,
  Card,
  Promo,
  Flex,
  Grid,
  Address,
  BodyText,
  CTA,
  Emails,
  FAQsSection,
  GetDirections,
  HeadingText,
  HoursStatus,
  HoursTable,
  ImageWrapper,
  ProductCard,
  Phone,
  TextList,
  Header,
  Footer,
  Directory,
  Breadcrumbs,
  MapboxStaticMap,
  ExampleRepeatableItemComponent,
  CollectionSection,
  Testimonials,
  NearbyLocations,
  PersonCard,
  Events,
  HeroSection,
  PhotoGallerySection,
  CoreInfoSection,
  InsightsSection,
};

const pageSections: (keyof MainProps)[] = [
  "Banner",
  "Breadcrumbs",
  "Card",
  "CoreInfoSection",
  "FAQsSection",
  "HeroSection",
  "InsightsSection",
  "PhotoGallerySection",
  "Promo",
  "Testimonials",
  "PersonCard",
  "Events",
];

const layoutBlocks: (keyof MainProps)[] = ["Flex", "Grid"];

const contentBlocks: (keyof MainProps)[] = [
  "Address",
  "BodyText",
  "CTA",
  "Emails",
  "GetDirections",
  "HeadingText",
  "HoursStatus",
  "HoursTable",
  "ImageWrapper",
  "MapboxStaticMap",
  "Phone",
  "TextList",
];

const cardBlocks: (keyof MainProps)[] = ["ProductCard"];

// All the available components for locations
export const mainConfig: Config<MainProps> = {
  components,
  categories: {
    pageSections: {
      title: "Page Sections",
      components: pageSections,
    },
    layoutBlocks: {
      title: "Layout Blocks",
      components: layoutBlocks,
    },
    cardBlocks: {
      title: "Cards",
      components: cardBlocks,
    },
    contentBlocks: {
      title: "Content Blocks",
      components: contentBlocks,
    },
  },
  root: {
    render: () => {
      return (
        <DropZone
          zone="default-zone"
          disallow={contentBlocks}
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}
        />
      );
    },
  },
};

export const componentRegistry = new Map<string, Config<any>>([
  ["dev", mainConfig],
]);
