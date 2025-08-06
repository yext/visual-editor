import { DefaultComponentProps, type Config } from "@measured/puck";

// The components that are disallowed by default. They are only visible and draggable if a business has the appropriate product features enabled.
const gatedLayoutComponents: string[] = ["CustomCodeSection"];

// The categories that are disallowed by default. Their components are only visible and draggable if a business has the appropriate product features enabled.
const gatedLayoutCategories: string[] = ["coreInformation"];

/**
 * Filters out gated layout components from a configuration object unless explicitly allowed.
 *
 * @param config - The original configuration object.
 * @param additionalLayoutComponents - An optional list of gated component names to retain.
 * @param additionalLayoutCategories - An optional list of gated categories to retain.
 * @returns A new configuration object with all gated components removed, except for those listed in `additionalLayoutComponents`.
 */
export const filterComponentsFromConfig = <T extends DefaultComponentProps>(
  config: Config<T>,
  additionalLayoutComponents?: string[],
  additionalLayoutCategories?: string[]
): Config<T> => {
  // 1. Filter out gated categories unless they are explicitly allowed
  const filteredCategories = Object.entries(config.categories || {}).filter(
    ([categoryKey]) => {
      const isGated = gatedLayoutCategories.includes(categoryKey);
      const isGrantedAccess = additionalLayoutCategories?.includes(categoryKey);
      return !isGated || isGrantedAccess;
    }
  );

  // 2. Collect all component names under the filtered categories
  const componentsUnderFilteredCategories = new Set<string>(
    filteredCategories.flatMap(([, category]) =>
      (category.components ?? []).map(
        (componentName) => componentName as string
      )
    )
  );

  // 3. Filter out
  // - components that are exclusive to the disallowed categories
  //   (e.g `Grid` component is exclusive to `coreInformation` category. So if `coreInformation` is filtered out, `Grid` will also be filtered out)
  // - gated components unless they are explicitly allowed
  const filteredComponents = Object.entries(config.components).filter(
    ([componentKey]) => {
      const isUnderFilteredCategories =
        componentsUnderFilteredCategories.has(componentKey);
      const isGated = gatedLayoutComponents.includes(componentKey);
      const isGrantedAccess =
        additionalLayoutComponents?.includes(componentKey);
      return (isUnderFilteredCategories && !isGated) || isGrantedAccess;
    }
  );

  return {
    ...config,
    components: Object.fromEntries(
      filteredComponents
    ) as Config<T>["components"],
    categories: Object.fromEntries(
      filteredCategories
    ) as Config<T>["categories"],
  };
};
