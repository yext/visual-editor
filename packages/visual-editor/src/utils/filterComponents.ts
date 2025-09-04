import { type Config } from "@measured/puck";

// The components that are disallowed by default.
const gatedLayoutComponents: string[] = ["CustomCodeSection"];

// The categories that are disallowed by default.
const gatedLayoutCategories: string[] = ["coreInformation"];

/**
 * Filters out gated layout components and categories from a Puck configuration object.
 *
 * @param config - The original Puck configuration object.
 * @param additionalLayoutComponents - An optional list of gated component names to keep.
 * @param additionalLayoutCategories - An optional list of gated category names to keep.
 * @returns A new, filtered configuration object.
 */
export const filterComponentsFromConfig = <C extends Config>(
  config: C,
  additionalLayoutComponents: string[] = [],
  additionalLayoutCategories: string[] = []
): C => {
  // Step 1: Determine the allowed categories
  // A category is allowed if it's not gated or is explicitly allowed.
  const allowedCategories = Object.fromEntries(
    Object.entries(config.categories || {}).filter(([categoryKey]) => {
      const isGated = gatedLayoutCategories.includes(categoryKey);
      const isExplicitlyAllowed =
        additionalLayoutCategories.includes(categoryKey);
      return !isGated || isExplicitlyAllowed;
    })
  );

  // Get all component names that belong to these allowed categories.
  const componentNamesFromAllowedCategories = new Set<string>(
    Object.values(allowedCategories).flatMap(
      (category) => category.components ?? []
    )
  );

  // Step 2: Determine the allowed components
  // A component is allowed if ((it is not gated or is explicitly allowed) AND belongs to an allowed category).
  const finalComponents = Object.fromEntries(
    Object.entries(config.components).filter(([componentKey]) => {
      const isGated = gatedLayoutComponents.includes(componentKey);
      const isExplicitlyAllowed =
        additionalLayoutComponents.includes(componentKey);
      const allowed = !isGated || isExplicitlyAllowed;

      return allowed && componentNamesFromAllowedCategories.has(componentKey);
    })
  );

  // Step 3: Update the component list for each category
  // Categories independently maintain a list of components so we
  // need to update each category to remove any disallowed components
  const allowedComponentKeys = new Set(Object.keys(finalComponents));
  const finalCategories = Object.fromEntries(
    Object.entries(allowedCategories).map(([key, category]) => [
      key,
      {
        ...category,
        components: (category.components ?? []).filter((componentName) =>
          allowedComponentKeys.has(componentName)
        ),
      },
    ])
  );

  return {
    ...config,
    components: finalComponents as C["components"],
    categories: finalCategories as C["categories"],
  };
};
