import { type Config } from "@puckeditor/core";
import "@yext/visual-editor/style.css";
import "./index.css";
import {
  DirectoryCategory,
  DirectoryCategoryComponents,
  DirectoryCategoryProps,
  LocatorConfigProps,
  MainConfigProps,
  locatorConfig,
  mainConfig,
} from "@yext/visual-editor";

interface DevProps extends MainConfigProps, DirectoryCategoryProps {}

const components: Config<DevProps>["components"] = {
  ...mainConfig.components,
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
