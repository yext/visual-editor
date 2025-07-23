import { DropZone, type Config } from "@measured/puck";
import "@yext/visual-editor/style.css";
import "./index.css";
import {
  PageSectionCategory,
  PageSectionCategoryComponents,
  PageSectionCategoryProps,
  OtherCategoryComponents,
  OtherCategoryProps,
  DirectoryCategory,
  DirectoryCategoryComponents,
  DirectoryCategoryProps,
  TextListProps,
  PhoneProps,
} from "@yext/visual-editor";
import { TestHero, TestHeroProps } from "./test-components/TestHero";
import {
  Address,
  AddressProps,
  BodyText,
  BodyTextProps,
  CtaWrapper,
  CtaWrapperProps,
  Emails,
  EmailsProps,
  GetDirections,
  GetDirectionsProps,
  HeadingText,
  HeadingTextProps,
  HoursStatus,
  HoursStatusProps,
  HoursTable,
  HoursTableProps,
  GridSection,
  GridSectionProps,
  TextList,
  Phone,
  MapboxStaticMap,
  MapboxStaticProps,
} from "./test-components";

interface MainProps
  extends PageSectionCategoryProps,
    DirectoryCategoryProps,
    OtherCategoryProps {
  TestHero: TestHeroProps;
  Address: AddressProps;
  BodyText: BodyTextProps;
  CtaWrapper: CtaWrapperProps;
  Emails: EmailsProps;
  GetDirections: GetDirectionsProps;
  HeadingText: HeadingTextProps;
  HoursStatus: HoursStatusProps;
  HoursTable: HoursTableProps;
  TextList: TextListProps;
  Phone: PhoneProps;
  GridSection: GridSectionProps;
  MapboxStaticMap: MapboxStaticProps;
}

const components: Config<MainProps>["components"] = {
  ...PageSectionCategoryComponents,
  ...DirectoryCategoryComponents,
  ...OtherCategoryComponents,
  TestHero,
  Address,
  BodyText,
  CtaWrapper,
  Emails,
  GetDirections,
  HeadingText,
  HoursStatus,
  HoursTable,
  GridSection,
  TextList,
  Phone,
  MapboxStaticMap,
};

// All the available components for locations
export const mainConfig: Config<MainProps> = {
  components,
  categories: {
    pageSections: {
      title: "Page Sections",
      components: [...PageSectionCategory, "TestHero"],
    },
    directory: {
      title: "Directory",
      components: DirectoryCategory,
    },
    atoms: {
      title: "Atoms",
      components: [
        "Address",
        "BodyText",
        "CtaWrapper",
        "Emails",
        "GetDirections",
        "HeadingText",
        "HoursStatus",
        "HoursTable",
        "TextList",
        "Phone",
        "MapboxStaticMap",
      ],
    },
    layoutBlocks: {
      title: "Layout Blocks",
      components: ["GridSection"],
    },
  },
  root: {
    render: () => {
      return (
        <DropZone
          zone="default-zone"
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}
        />
      );
    },
  },
};

export const componentRegistry = new Map<string, Config<any>>([
  ["dev", mainConfig],
]);
