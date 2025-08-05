import { DefaultComponentProps, type Config } from "@measured/puck";

// The gated components that are disallowed by default. They are only visible and draggable if a business has the appropriate product features enabled.
const gatedLayoutComponents: string[] = ["CustomCodeSection", "GridSection"];

/**
 * Filters out gated layout components from a configuration object unless explicitly allowed.
 *
 * @param config - The original configuration object.
 * @param additionalLayoutComponents - An optional list of gated component names to retain.
 * @returns A new configuration object with all gated components removed, except for those listed in `additionalLayoutComponents`.
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
