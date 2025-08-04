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
  AdvancedCoreInfoCategoryProps,
  AdvancedCoreInfoCategoryComponents,
  AdvancedCoreInfoCategory,
} from "@yext/visual-editor";
import * as React from "react";

interface MainProps
  extends PageSectionCategoryProps,
    DirectoryCategoryProps,
    OtherCategoryProps,
    AdvancedCoreInfoCategoryProps {}

const components: Config<MainProps>["components"] = {
  ...PageSectionCategoryComponents,
  ...DirectoryCategoryComponents,
  ...OtherCategoryComponents,
  ...AdvancedCoreInfoCategoryComponents,
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
    coreInformation: {
      title: "Core Information",
      components: AdvancedCoreInfoCategory,
    },
  },
  root: {
    render: () => {
      return (
        <DropZone
          zone="default-zone"
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}
          disallow={AdvancedCoreInfoCategory.filter((k) => k !== "Grid")}
        />
      );
    },
  },
};

export const componentRegistry = new Map<string, Config<any>>([
  ["dev", mainConfig],
]);
