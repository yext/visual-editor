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
  Testimonials,
  TestimonialsProps,
  ProductsSection,
  ProductsSectionProps,
  People,
  PeopleProps,
  FAQsSection,
  FAQsSectionProps,
  Events,
  EventsProps,
  HeroSectionProps,
  HeroSection,
  PhotoGallerySectionProps,
  PhotoGallerySection,
  ArticleSection,
  ArticleSectionProps,
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
  ProductsSection: ProductsSectionProps;
  Promo: PromoProps;
  TextList: TextListProps;
  Testimonials: TestimonialsProps;
  People: PeopleProps;
  Events: EventsProps;
  HeroSection: HeroSectionProps;
  PhotoGallerySection: PhotoGallerySectionProps;
  ArticleSection: ArticleSectionProps;
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
  Phone,
  TextList,
  Header,
  Footer,
  Directory,
  Breadcrumbs,
  MapboxStaticMap,
  Testimonials,
  ProductsSection,
  People,
  Events,
  HeroSection,
  PhotoGallerySection,
  ArticleSection,
};

const pageSections: (keyof MainProps)[] = [
  "ArticleSection",
  "Banner",
  "Breadcrumbs",
  "Card",
  "FAQsSection",
  "HeroSection",
  "PhotoGallerySection",
  "ProductsSection",
  "Promo",
  "Testimonials",
  "People",
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
