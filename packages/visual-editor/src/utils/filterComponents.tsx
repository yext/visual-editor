import { type Config } from "@measured/puck";

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
export const filterComponentsFromConfig = <C extends Config>(
  config: C,
  additionalLayoutComponents?: string[],
  additionalLayoutCategories?: string[]
): C => {
  // 1. Filter out gated categories unless they are explicitly allowed
  const allowedCategories = Object.entries(config.categories || {}).filter(
    ([categoryKey]) => {
      const isGated = gatedLayoutCategories.includes(categoryKey);
      const isExplicitlyAllowed =
        additionalLayoutCategories?.includes(categoryKey);
      return !isGated || isExplicitlyAllowed;
    }
  );

  // 2. Collect all component names under the allowed categories
  const componentsUnderAllowedCategories = new Set<string>(
    allowedCategories.flatMap(([, category]) =>
      (category.components ?? []).map(
        (componentName) => componentName as string
      )
    )
  );

  // 3. Filter components based on:
  // - If the component is gated, it must be explicitly allowed
  // - It must exist under an allowed category
  //   (e.g `Grid` component is exclusive to `coreInformation` category. So if `coreInformation` is disallowed, `Grid` will also be disallowed)
  const allowedComponents = Object.entries(config.components).filter(
    ([componentKey]) => {
      const isUnderAllowedCategories =
        componentsUnderAllowedCategories.has(componentKey);
      const isGated = gatedLayoutComponents.includes(componentKey);
      const isExplicitlyAllowed =
        additionalLayoutComponents?.includes(componentKey);
      return (!isGated || isExplicitlyAllowed) && isUnderAllowedCategories;
    }
  );

  // 4. Rebuild the categories object by iterating over all original categories and
  //    filtering their internal `components` list based on the allowed components.
  const allowedComponentKeys = new Set(allowedComponents.map(([key]) => key));
  const updatedCategories = allowedCategories.map(
    ([categoryKey, categoryValue]) => {
      const filteredComponents = (categoryValue.components ?? []).filter(
        (componentName) => allowedComponentKeys.has(componentName)
      );

      return [
        categoryKey,
        { ...categoryValue, components: filteredComponents },
      ];
    }
  );

  return {
    ...config,
    components: Object.fromEntries(allowedComponents) as C["components"],
    categories: Object.fromEntries(updatedCategories) as C["categories"],
  };
};
