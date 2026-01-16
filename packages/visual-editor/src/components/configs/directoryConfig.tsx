import { Config, DropZone, setDeep } from "@measured/puck";
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

export interface DirectoryConfigProps
  extends DirectoryCategoryProps,
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
      const updatedData = { ...data };

      if (
        data.props?.title?.constantValue?.en &&
        data.props.title.constantValue?.en === "PLACEHOLDER"
      ) {
        let titleValue = "Locations";
        switch (params.metadata?.streamDocument?.meta?.entityType?.id) {
          case "dm_root": {
            titleValue = "Locations";
            break;
          }
          case "dm_country": {
            titleValue = "Locations in [[dm_addressCountryDisplayName]]";
            break;
          }
          case "dm_region": {
            titleValue = "Locations in [[dm_addressRegionDisplayName]]";
            break;
          }
          case "dm_city": {
            titleValue = "Locations in [[name]]";
            break;
          }
        }

        setDeep(updatedData, "props.title.constantValue.en", titleValue);
      }
      if (
        data.props?.description?.constantValue?.en &&
        data.props.description.constantValue?.en === "PLACEHOLDER"
      ) {
        let descriptionValue = "Locations";
        switch (params.metadata?.streamDocument?.meta?.entityType?.id) {
          case "dm_root": {
            descriptionValue = "Browse all locations";
            break;
          }
          case "dm_country": {
            descriptionValue =
              "Browse locations in [[dm_addressCountryDisplayName]]";
            break;
          }
          case "dm_region": {
            descriptionValue =
              "Browse locations in [[dm_addressRegionDisplayName]]";
            break;
          }
          case "dm_city": {
            descriptionValue = "Browse locations in [[name]]";
            break;
          }
        }

        setDeep(
          updatedData,
          "props.description.constantValue.en",
          descriptionValue
        );
      }

      return updatedData;
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
