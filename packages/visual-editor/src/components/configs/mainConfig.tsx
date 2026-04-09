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
  ROOT_FOOTER_COMPONENTS,
  ROOT_FOOTER_ZONE,
  ROOT_HEADER_COMPONENTS,
  ROOT_HEADER_ZONE,
  ROOT_MAIN_DISALLOWED_COMPONENTS,
  ROOT_MAIN_ZONE,
} from "../../utils/rootZones.ts";

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
      const mainZoneDisallow = [
        ...ROOT_MAIN_DISALLOWED_COMPONENTS,
        ...AdvancedCoreInfoCategory.filter((k) => k !== "Grid"),
      ];

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
              disallow={mainZoneDisallow}
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
