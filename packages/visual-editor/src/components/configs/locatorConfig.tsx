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
import {
  ROOT_FOOTER_COMPONENTS,
  ROOT_FOOTER_ZONE,
  ROOT_HEADER_COMPONENTS,
  ROOT_HEADER_ZONE,
  ROOT_MAIN_DISALLOWED_COMPONENTS,
  ROOT_MAIN_ZONE,
} from "../../utils/rootZones.ts";

export interface LocatorConfigProps
  extends LocatorCategoryProps,
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
      title: pt("categories.standardSections", "Standard Sections"),
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <DropZone
            zone={ROOT_HEADER_ZONE}
            allow={[...ROOT_HEADER_COMPONENTS]}
            style={{ display: "flex", flexDirection: "column" }}
          />
          <main
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
            }}
          >
            <DropZone
              zone={ROOT_MAIN_ZONE}
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
              }}
              disallow={[...ROOT_MAIN_DISALLOWED_COMPONENTS]}
            />
          </main>
          <DropZone
            zone={ROOT_FOOTER_ZONE}
            allow={[...ROOT_FOOTER_COMPONENTS]}
            style={{ display: "flex", flexDirection: "column" }}
          />
        </div>
      );
    },
  },
};
