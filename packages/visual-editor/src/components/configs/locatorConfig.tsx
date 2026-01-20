import { Config, DropZone } from "@measured/puck";
import {
  DeprecatedCategory,
  DeprecatedCategoryComponents,
  type DeprecatedCategoryProps,
} from "../categories/DeprecatedCategory";
import {
  LocatorCategory,
  LocatorCategoryComponents,
  type LocatorCategoryProps,
} from "../categories/LocatorCategory";
import {
  OtherCategory,
  OtherCategoryComponents,
  type OtherCategoryProps,
} from "../categories/OtherCategory";
import { BannerSection, BannerSectionProps } from "../pageSections/Banner";
import {
  SlotsCategory,
  SlotsCategoryComponents,
  SlotsCategoryProps,
} from "../categories/SlotsCategory";

export interface LocatorConfigProps
  extends
    LocatorCategoryProps,
    SlotsCategoryProps,
    DeprecatedCategoryProps,
    OtherCategoryProps {
  BannerSection: BannerSectionProps;
}

// The config used for the locator
export const locatorConfig: Config<LocatorConfigProps> = {
  components: {
    ...LocatorCategoryComponents,
    ...SlotsCategoryComponents,
    ...DeprecatedCategoryComponents,
    ...OtherCategoryComponents,
    BannerSection,
  },
  categories: {
    pageSections: {
      title: "Page Sections",
      components: [...LocatorCategory, "BannerSection"],
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
    other: {
      components: OtherCategory,
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
        />
      );
    },
  },
};
