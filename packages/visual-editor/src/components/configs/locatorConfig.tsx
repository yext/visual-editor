import { Config, DropZone } from "@puckeditor/core";
import {
  DeprecatedCategory,
  DeprecatedCategoryComponents,
  type DeprecatedCategoryProps,
} from "../categories/DeprecatedCategory.tsx";
import {
  LocatorCategory,
  LocatorCategoryComponents,
  type LocatorCategoryProps,
} from "../categories/LocatorCategory.tsx";
import {
  OtherCategory,
  OtherCategoryComponents,
  type OtherCategoryProps,
} from "../categories/OtherCategory.tsx";
import { BannerSection, BannerSectionProps } from "../pageSections/Banner.tsx";
import {
  SlotsCategory,
  SlotsCategoryComponents,
  SlotsCategoryProps,
} from "../categories/SlotsCategory.tsx";
import { pt } from "../../utils/i18n/platform.ts";
import { MainContent, MainContentProps } from "../structure/MainContent.tsx";

export interface LocatorConfigProps
  extends LocatorCategoryProps,
    SlotsCategoryProps,
    DeprecatedCategoryProps,
    OtherCategoryProps {
  BannerSection: BannerSectionProps;
  MainContent: MainContentProps;
}

const rootAllowedComponents = [
  "ExpandedHeader",
  "ExpandedFooter",
  "MainContent",
];

const components: Config<LocatorConfigProps>["components"] = {
  ...LocatorCategoryComponents,
  ...SlotsCategoryComponents,
  ...DeprecatedCategoryComponents,
  ...OtherCategoryComponents,
  BannerSection,
  MainContent,
};

// The config used for the locator
export const locatorConfig: Config<LocatorConfigProps> = {
  components,
  categories: {
    pageSections: {
      title: pt("categories.standardSections", "Standard Sections"),
      components: [...LocatorCategory, "BannerSection"],
    },
    slots: {
      components: SlotsCategory,
      visible: false,
    },
    structure: {
      components: ["MainContent"],
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
          disallow={Object.keys(components).filter(
            (componentName) => !rootAllowedComponents.includes(componentName)
          )}
        />
      );
    },
  },
};
