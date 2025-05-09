import { DropZone, type Config } from "@measured/puck";
import "@yext/visual-editor/style.css";
import "./index.css";
import {
  PageSectionCategory,
  PageSectionCategoryComponents,
  PageSectionCategoryProps,
  LayoutBlockCategory,
  CardCategory,
  ContentBlockCategory,
  LayoutBlockCategoryComponents,
  CardCategoryComponents,
  ContentBlockCategoryComponents,
  OtherCategoryComponents,
  LayoutBlockCategoryProps,
  CardCategoryProps,
  ContentBlockCategoryProps,
  OtherCategoryProps,
  DirectoryCategory,
  DirectoryCategoryComponents,
  DirectoryCategoryProps,
} from "@yext/visual-editor";

import { LocatorComponent, LocatorProps } from "./components/Locator.js"; // only for hot reloading; final code should be imported above

interface LocatorCategoryProps {
  Locator: LocatorProps;
}
const LocatorCategoryComponents = {
  LocatorComponent,
};

const LocatorCategory = Object.keys(
  LocatorCategoryComponents,
) as (keyof LocatorCategoryProps)[];

interface MainProps
  extends PageSectionCategoryProps,
    LayoutBlockCategoryProps,
    CardCategoryProps,
    ContentBlockCategoryProps,
    DirectoryCategoryProps,
    OtherCategoryProps,
    LocatorCategoryProps {}

const components: Config<MainProps>["components"] = {
  ...PageSectionCategoryComponents,
  ...LayoutBlockCategoryComponents,
  ...CardCategoryComponents,
  ...ContentBlockCategoryComponents,
  ...DirectoryCategoryComponents,
  ...OtherCategoryComponents,
  ...LocatorCategoryComponents,
};

// All the available components for locations
export const mainConfig: Config<MainProps> = {
  components,
  categories: {
    pageSections: {
      title: "Page Sections",
      components: PageSectionCategory,
    },
    layoutBlocks: {
      title: "Layout Blocks",
      components: LayoutBlockCategory,
    },
    cardBlocks: {
      title: "Cards",
      components: CardCategory,
    },
    contentBlocks: {
      title: "Content Blocks",
      components: ContentBlockCategory,
    },
    directory: {
      title: "Directory",
      components: DirectoryCategory,
    },
    locator: {
      title: "Locator",
      components: LocatorCategory,
    },
  },
  root: {
    render: () => {
      return (
        <DropZone
          zone="default-zone"
          disallow={[
            ...ContentBlockCategory,
            ...CardCategory,
            ...LayoutBlockCategory,
          ]}
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}
        />
      );
    },
  },
};

export const componentRegistry = new Map<string, Config<any>>([
  ["dev", mainConfig],
]);
