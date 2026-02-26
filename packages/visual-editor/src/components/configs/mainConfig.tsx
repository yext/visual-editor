import { DropZone, Config } from "@puckeditor/core";
import { pt } from "../../utils/i18n/platform.ts";
import {
  DeprecatedCategory,
  DeprecatedCategoryComponents,
  type DeprecatedCategoryProps,
} from "../categories/DeprecatedCategory.tsx";
import {
  PageSectionCategory,
  PageSectionCategoryComponents,
  type PageSectionCategoryProps,
} from "../categories/PageSectionCategory.tsx";
import {
  OtherCategory,
  OtherCategoryComponents,
  type OtherCategoryProps,
} from "../categories/OtherCategory.tsx";
import {
  AdvancedCoreInfoCategory,
  AdvancedCoreInfoCategoryComponents,
  type AdvancedCoreInfoCategoryProps,
} from "../categories/AdvancedCoreInfoCategory.tsx";
import {
  SlotsCategory,
  SlotsCategoryComponents,
  SlotsCategoryProps,
} from "../categories/SlotsCategory.tsx";
import {
  YetiSectionsCategory,
  YetiSectionsCategoryComponents,
  type YetiSectionsCategoryProps,
} from "../categories/YetiSectionsCategory.tsx";
import {
  YetiSlotsCategory,
  YetiSlotsCategoryComponents,
  type YetiSlotsCategoryProps,
} from "../categories/YetiSlotsCategory.tsx";

export interface MainConfigProps
  extends PageSectionCategoryProps,
    DeprecatedCategoryProps,
    OtherCategoryProps,
    AdvancedCoreInfoCategoryProps,
    SlotsCategoryProps,
    YetiSectionsCategoryProps,
    YetiSlotsCategoryProps {}

const components: Config<MainConfigProps>["components"] = {
  ...PageSectionCategoryComponents,
  ...YetiSectionsCategoryComponents,
  ...DeprecatedCategoryComponents,
  ...OtherCategoryComponents,
  ...AdvancedCoreInfoCategoryComponents,
  ...SlotsCategoryComponents,
  ...YetiSlotsCategoryComponents,
};

// The config used for base entities (locations, financial professionals, etc.)
export const mainConfig: Config<MainConfigProps> = {
  components,
  categories: {
    pageSections: {
      title: pt("categories.standardSections", "Standard Sections"),
      components: PageSectionCategory,
    },
    yetiSections: {
      title: pt("categories.yetiSections", "Yeti Sections"),
      components: YetiSectionsCategory,
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
    yetiSlots: {
      components: YetiSlotsCategory,
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
