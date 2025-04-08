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
  PhoneWrapper,
  PhoneWrapperProps,
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
  NearbyLocations,
  NearbyLocationsProps,
  People,
  PeopleProps,
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
  PhoneWrapper: PhoneWrapperProps;
  Promo: PromoProps;
  TextList: TextListProps;
  Testimonials: TestimonialsProps;
  NearbyLocations: NearbyLocationsProps;
  People: PeopleProps;
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
  GetDirections,
  HeadingText,
  HoursStatus,
  HoursTable,
  ImageWrapper,
  PhoneWrapper,
  TextList,
  Header,
  Footer,
  Directory,
  Breadcrumbs,
  MapboxStaticMap,
  Testimonials,
  NearbyLocations,
  People,
};

const pageSections: (keyof MainProps)[] = [
  "Banner",
  "Breadcrumbs",
  "Card",
  "Promo",
  "Testimonials",
  "People",
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
  "PhoneWrapper",
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
