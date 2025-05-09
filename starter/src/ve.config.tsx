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

import { Locator, LocatorProps } from "./components/Locator.js"; // only for hot reloading; final code should be imported above

interface LocatorCategoryProps {
  Locator: LocatorProps;
}
const LocatorCategoryComponents = {
  Locator,
};

const LocatorCategory = Object.keys(
  LocatorCategoryComponents,
) as (keyof LocatorCategoryProps)[];

interface MainProps
  extends PageSectionCategoryProps,
    DirectoryCategoryProps,
    OtherCategoryProps,
    LocatorCategoryProps {}

const components: Config<MainProps>["components"] = {
  ...PageSectionCategoryComponents,
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
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}
        />
      );
    },
  },
};

export const componentRegistry = new Map<string, Config<any>>([
  ["dev", mainConfig],
]);
