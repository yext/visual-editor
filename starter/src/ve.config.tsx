import { type Config } from "@puckeditor/core";
import "@yext/visual-editor/style.css";
import "./index.css";
import {
  DirectoryCategory,
  DirectoryCategoryComponents,
  DirectoryCategoryProps,
  MainConfigProps,
  mainConfig,
} from "@yext/visual-editor";
import { SweetgreenFaqSection } from "./registry/sweetgreen/components/SweetgreenFaqSection";
import { SweetgreenFindUsSection } from "./registry/sweetgreen/components/SweetgreenFindUsSection";
import { SweetgreenFooterSection } from "./registry/sweetgreen/components/SweetgreenFooterSection";
import { SweetgreenLocationHeroSection } from "./registry/sweetgreen/components/SweetgreenLocationHeroSection";
import { SweetgreenMenuSection } from "./registry/sweetgreen/components/SweetgreenMenuSection";
import { SweetgreenPromoCardsSection } from "./registry/sweetgreen/components/SweetgreenPromoCardsSection";
import { SweetgreenRequestLocationSection } from "./registry/sweetgreen/components/SweetgreenRequestLocationSection";
import { SweetgreenSiteHeaderSection } from "./registry/sweetgreen/components/SweetgreenSiteHeaderSection";
import { SweetgreenSustainabilitySection } from "./registry/sweetgreen/components/SweetgreenSustainabilitySection";

interface DevProps extends MainConfigProps, DirectoryCategoryProps {}

const components = {
  ...mainConfig.components,
  ...DirectoryCategoryComponents,
  SweetgreenSiteHeaderSection,
  SweetgreenLocationHeroSection,
  SweetgreenFindUsSection,
  SweetgreenMenuSection,
  SweetgreenPromoCardsSection,
  SweetgreenRequestLocationSection,
  SweetgreenSustainabilitySection,
  SweetgreenFaqSection,
  SweetgreenFooterSection,
} as Config<DevProps>["components"];

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

export const componentRegistry: Record<string, Config<DevProps>> = {
  dev: devConfig,
};
