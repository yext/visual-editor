import { Config, DropZone } from "@measured/puck";
import { msg } from "@yext/visual-editor";
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

export interface DirectoryConfigProps
  extends DirectoryCategoryProps,
    DeprecatedCategoryProps,
    OtherCategoryProps {}

// The config used for all levels of directory pages
export const directoryConfig: Config<DirectoryConfigProps> = {
  components: {
    ...DirectoryCategoryComponents,
    ...DeprecatedCategoryComponents,
    ...OtherCategoryComponents,
  },
  categories: {
    directoryComponents: {
      title: msg("categories.directory", "Directory"),
      components: [...DirectoryCategory, ...OtherCategory],
    },
    // deprecated components are hidden in the sidebar but still render if used in the page
    deprecatedComponents: {
      visible: false,
      components: DeprecatedCategory,
    },
    other: {
      visible: false,
    },
  },
  root: {
    render: () => {
      return (
        <DropZone
          zone="default-zone"
          style={{ display: "flex", flexDirection: "column", height: "100vh" }}
        />
      );
    },
  },
};
