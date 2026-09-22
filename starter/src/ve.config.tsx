import { type Config } from "@puckeditor/core";
import "@yext/visual-editor/style.css";
import "./index.css";
import {
  DirectoryCategory,
  DirectoryCategoryComponents,
  DirectoryCategoryProps,
  MainConfigProps,
  locatorConfig,
  mainConfig,
  FormSection,
} from "@yext/visual-editor";

interface DevProps extends MainConfigProps, DirectoryCategoryProps {}

const components: Config<DevProps>["components"] = {
  ...mainConfig.components,
  FormSection: {
    ...FormSection,
    defaultProps: {
      ...FormSection.defaultProps,
      data: {
        ...FormSection.defaultProps.data,
        turnstileSiteKey: "1x00000000000000000000AA",
      },
    },
  },
  ...DirectoryCategoryComponents,
};

export const devConfig: Config<DevProps> = {
  components,
  categories: {
    ...mainConfig.categories,
    directory: {
      title: "Directory",
      components: DirectoryCategory,
    },
  },
  root: mainConfig.root,
};

// TODO: Use mainConfig directly for dev-location once directory templates are supported
export const componentRegistry: Record<string, Config<any>> = {
  "dev-location": devConfig,
  "dev-locator": locatorConfig,
};
