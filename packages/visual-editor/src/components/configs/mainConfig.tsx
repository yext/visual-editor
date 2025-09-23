import { DropZone, Config } from "@measured/puck";
import {
  DeprecatedCategory,
  DeprecatedCategoryComponents,
  type DeprecatedCategoryProps,
} from "../categories/DeprecatedCategory";
import {
  PageSectionCategory,
  PageSectionCategoryComponents,
  type PageSectionCategoryProps,
} from "../categories/PageSectionCategory";
import {
  OtherCategory,
  OtherCategoryComponents,
  type OtherCategoryProps,
} from "../categories/OtherCategory";
import {
  AdvancedCoreInfoCategory,
  AdvancedCoreInfoCategoryComponents,
  type AdvancedCoreInfoCategoryProps,
} from "../categories/AdvancedCoreInfoCategory";
import {
  LockedCategory,
  LockedCategoryComponents,
  type LockedCategoryProps,
} from "../categories/LockedCategory";

export interface MainConfigProps
  extends PageSectionCategoryProps,
    DeprecatedCategoryProps,
    OtherCategoryProps,
    AdvancedCoreInfoCategoryProps,
    LockedCategoryProps {}

const components: Config<MainConfigProps>["components"] = {
  ...PageSectionCategoryComponents,
  ...DeprecatedCategoryComponents,
  ...OtherCategoryComponents,
  ...AdvancedCoreInfoCategoryComponents,
  ...LockedCategoryComponents,
};

// The config used for base entities (locations, financial professionals, etc.)
export const mainConfig: Config<MainConfigProps> = {
  components,
  categories: {
    pageSections: {
      title: "Page Sections",
      components: PageSectionCategory,
    },
    coreInformation: {
      title: "Core Information",
      components: AdvancedCoreInfoCategory,
    },
    other: {
      title: "Other",
      components: OtherCategory,
    },
    // deprecated components are hidden in the sidebar but still render if used in the page
    deprecatedComponents: {
      visible: false,
      components: DeprecatedCategory,
    },
    // locked components are hidden in the sidebar but still render if used in the page
    lockedComponents: {
      visible: false,
      components: LockedCategory,
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
