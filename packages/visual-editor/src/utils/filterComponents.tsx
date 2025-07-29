import { DefaultComponentProps, type Config } from "@measured/puck";

const gatedLayoutComponents: string[] = ["CustomCodeSection", "GridSection"];

/**
 * Filters out gated layout components from a configuration object unless explicitly allowed.
 *
 * @param config - The original configuration object.
 * @param additionalLayoutComponents - An optional list of gated component names to retain.
 * @returns The new configuration object with gated components that are not present in `additionalLayoutComponents` removed.
 */
export const filterComponentsFromConfig = <T extends DefaultComponentProps>(
  config: Config<T>,
  additionalLayoutComponents?: string[]
): Config<T> => {
  // Filter components object
  const filteredComponents = Object.fromEntries(
    Object.entries(config.components).filter(
      ([key]) =>
        !gatedLayoutComponents.includes(key) ||
        additionalLayoutComponents?.includes(key)
    )
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
            additionalLayoutComponents?.includes(componentName as string)
        ),
      },
    ])
  );

  return {
    ...config,
    components: filteredComponents,
    categories: filteredCategories,
  };
};

/**
 * Filters gated layout components from a specific configuration in the registry.
 *
 * @param registry - The registry to be filtered.
 * @param registryKey - The key in the registry whose associated configuration should be filtered.
 * @param additionalLayoutComponents - An optional list of gated component names to retain.
 * @returns The new registry with the filtered configuration under the specified key.
 */
export const filterComponentsFromRegistry = (
  registry: Map<string, Config<any>>,
  registryKey: string,
  additionalLayoutComponents?: string[]
): Map<string, Config<any>> => {
  const newRegistry = new Map(registry);
  const config = newRegistry.get(registryKey);
  if (config) {
    newRegistry.set(
      registryKey,
      filterComponentsFromConfig(config, additionalLayoutComponents)
    );
  }
  return newRegistry;
};
