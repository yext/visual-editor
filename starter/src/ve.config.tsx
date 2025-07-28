import { DefaultComponentProps, DropZone, type Config } from "@measured/puck";
import "@yext/visual-editor/style.css";
import "./index.css";
import {
  PageSectionCategory,
  PageSectionCategoryComponents,
  PageSectionCategoryProps,
  OtherCategoryComponents,
  OtherCategoryProps,
  DirectoryCategory,
  DirectoryCategoryComponents,
  DirectoryCategoryProps,
} from "@yext/visual-editor";

interface MainProps
  extends PageSectionCategoryProps,
    DirectoryCategoryProps,
    OtherCategoryProps {}

const components: Config<MainProps>["components"] = {
  ...PageSectionCategoryComponents,
  ...DirectoryCategoryComponents,
  ...OtherCategoryComponents,
};

// All the available components for locations
export const mainConfig: Config<MainProps> = {
  components,
  categories: {
    pageSections: {
      title: "Page Sections",
      components: PageSectionCategory,
    },
    directory: {
      title: "Directory",
      components: DirectoryCategory,
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

export const componentRegistry = new Map<string, Config<any>>([
  ["dev", mainConfig],
]);

const gatedLayoutComponents: string[] = ["CustomCodeSection", "GridSection"];

export const filterComponentsFromConfig = <T extends DefaultComponentProps>(
  config: Config<T>,
  additionalLayoutComponents?: string[],
): Config<T> => {
  // Filter components object
  const filteredComponents = Object.fromEntries(
    Object.entries(config.components).filter(
      ([key]) =>
        !gatedLayoutComponents.includes(key) ||
        additionalLayoutComponents?.includes(key),
    ),
  ) as Config<T>["components"];

  // Filter categories by removing gated components that are not present in the additional components list from their components arrays
  const filteredCategories = Object.fromEntries(
    Object.entries(config.categories || {}).map(([categoryKey, category]) => [
      categoryKey,
      {
        ...category,
        components: (category.components || []).filter(
          (componentName) =>
            !gatedLayoutComponents.includes(componentName as string) ||
            additionalLayoutComponents?.includes(componentName as string),
        ),
      },
    ]),
  );

  return {
    ...config,
    components: filteredComponents,
    categories: filteredCategories,
  };
};

// Utility to filter components from a registry
export const filterComponentsFromRegistry = (
  registry: Map<string, Config<any>>,
  registryKey: string,
  additionalLayoutComponents?: string[],
): Map<string, Config<any>> => {
  const newRegistry = new Map(registry);
  const config = newRegistry.get(registryKey);
  if (config) {
    newRegistry.set(
      registryKey,
      filterComponentsFromConfig(config, additionalLayoutComponents),
    );
  }
  return newRegistry;
};
