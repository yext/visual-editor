import { DropZone, Config } from "@measured/puck";
import { pt } from "@yext/visual-editor";
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
  SlotsCategory,
  SlotsCategoryComponents,
  SlotsCategoryProps,
} from "../categories";

export interface MainConfigProps
  extends PageSectionCategoryProps,
    DeprecatedCategoryProps,
    OtherCategoryProps,
    AdvancedCoreInfoCategoryProps,
    SlotsCategoryProps {}

const components: Config<MainConfigProps>["components"] = {
  ...PageSectionCategoryComponents,
  ...DeprecatedCategoryComponents,
  ...OtherCategoryComponents,
  ...AdvancedCoreInfoCategoryComponents,
  ...SlotsCategoryComponents,
};

// The config used for base entities (locations, financial professionals, etc.)
export const mainConfig: Config<MainConfigProps> = {
  components,
  categories: {
    pageSections: {
      title: pt("categories.pageSections", "Page Sections"),
      components: PageSectionCategory,
    },
    coreInformation: {
      title: pt("categories.coreInformation", "Core Information"),
      components: AdvancedCoreInfoCategory,
    },
    other: {
      title: pt("categories.other", "Other"),
      components: OtherCategory,
    },
    slots: {
      components: SlotsCategory,
      visible: false,
    },
    // deprecated components are hidden in the sidebar but still render if used in the page
    deprecatedComponents: {
      visible: false,
      components: DeprecatedCategory,
    },
  },
  root: {
    render: () => {
      return (
        <DropZone
          zone="default-zone"
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
          disallow={AdvancedCoreInfoCategory.filter((k) => k !== "Grid")}
        />
      );
    },
  },
};
