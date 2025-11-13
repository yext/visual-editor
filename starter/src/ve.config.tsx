import { type Config } from "@measured/puck";
import "@yext/visual-editor/style.css";
import "./index.css";
import {
  DirectoryCategory,
  DirectoryCategoryComponents,
  DirectoryCategoryProps,
  MainConfigProps,
  mainConfig,
} from "@yext/visual-editor";
import { SlideshowSection } from "./component/Slideshow";

interface DevProps extends MainConfigProps, DirectoryCategoryProps {}

const components: Config<DevProps>["components"] = {
  ...mainConfig.components,
  ...DirectoryCategoryComponents,
  SlideshowSection,
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

// ✅ Export your registry (used by local dev + visual editor)
export const componentRegistry: Record<string, Config<DevProps>> = {
  dev: devConfig,
};
