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
} from "@yext/visual-editor";

import {
  ReviewsSectionDemo,
  ReviewsSectionDemoProps,
} from "./components/ReviewsSectionDemo";

interface LocalDemoProps {
  ReviewsSectionDemo: ReviewsSectionDemoProps;
}

const LocalDemoCategoryComponents = {
  ReviewsSectionDemo,
};

const LocalDemoCategory = Object.keys(
  LocalDemoCategoryComponents,
) as (keyof LocalDemoProps)[];

interface MainProps
  extends PageSectionCategoryProps,
    DirectoryCategoryProps,
    OtherCategoryProps,
    LocalDemoProps {}

const components: Config<MainProps>["components"] = {
  ...PageSectionCategoryComponents,
  ...DirectoryCategoryComponents,
  ...OtherCategoryComponents,
  ...LocalDemoCategoryComponents,
};

// All the available components for locations
export const mainConfig: Config<MainProps> = {
  components,
  categories: {
    pageSections: {
      title: "Page Sections",
      components: PageSectionCategory,
    },
    directory: {
      title: "Directory",
      components: DirectoryCategory,
    },
    localDemo: {
      title: "Local Demo",
      components: LocalDemoCategory,
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
