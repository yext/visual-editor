import { type Config } from "@puckeditor/core";
import {
  DirectoryCategory,
  DirectoryCategoryComponents,
  DirectoryCategoryProps,
  MainConfigProps,
  locatorConfig,
  mainConfig,
} from "@yext/visual-editor";
import "@yext/visual-editor/style.css";
import "./index.css";

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
