import { Config, DropZone } from "@measured/puck";
import {
  DeprecatedCategory,
  DeprecatedCategoryComponents,
  type DeprecatedCategoryProps,
} from "../categories/DeprecatedCategory";
import {
  DirectoryCategory,
  DirectoryCategoryComponents,
  type DirectoryCategoryProps,
} from "../categories/DirectoryCategory";
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
import { resolveDirectoryRootProps } from "../../utils/getPageMetadata";

export interface DirectoryConfigProps
  extends
    DirectoryCategoryProps,
    SlotsCategoryProps,
    DeprecatedCategoryProps,
    OtherCategoryProps {
  BannerSection: BannerSectionProps;
}

// The config used for all levels of directory pages
export const directoryConfig: Config<DirectoryConfigProps> = {
  components: {
    ...DirectoryCategoryComponents,
    ...SlotsCategoryComponents,
    ...DeprecatedCategoryComponents,
    ...OtherCategoryComponents,
    BannerSection,
  },
  categories: {
    pageSections: {
      title: "Page Sections",
      components: [...DirectoryCategory, "BannerSection"],
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
    resolveData: (data, params) => {
      return {
        ...data,
        props: resolveDirectoryRootProps(
          data.props ?? {},
          params.metadata?.streamDocument ?? {}
        ),
      };
    },
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
