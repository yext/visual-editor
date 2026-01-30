import { DropZone, Config } from "@puckeditor/core";
import { pt } from "../../utils/i18n/platform";
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
      title: pt("categories.standardSections", "Standard Sections"),
      components: Array.from(PageSectionCategory) as (keyof MainConfigProps)[],
    },
    coreInformation: {
      title: pt("categories.coreInformation", "Core Information"),
      components: Array.from(AdvancedCoreInfoCategory) as (keyof MainConfigProps)[],
    },
    other: {
      title: pt("categories.other", "Other"),
      components: Array.from(OtherCategory) as (keyof MainConfigProps)[],
    },
    slots: {
      components: Array.from(SlotsCategory) as (keyof MainConfigProps)[],
      visible: false,
    },
    // deprecated components are hidden in the sidebar but still render if used in the page
    deprecatedComponents: {
      visible: false,
      components: Array.from(DeprecatedCategory) as (keyof MainConfigProps)[],
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
          disallow={Array.from(AdvancedCoreInfoCategory).filter((k) => k !== "Grid")}
        />
      );
    },
  },
};
