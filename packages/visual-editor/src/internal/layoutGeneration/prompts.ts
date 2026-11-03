import type { PuckGenerationCatalog } from "../../utils/createPuckGenerationCatalog.ts";
import type { GenerationPromptBundle } from "../../types/generationPrompts.ts";
import { extractAuthored } from "./shared/authoredValues.ts";

/** Replacement values are opaque strings and are never expanded a second time. */
export const renderPrompt = (
  template: string,
  values: Record<string, string>
): string =>
  template.replace(/\{\{([^{}]+)\}\}/g, (_match, key: string) => {
    if (!Object.hasOwn(values, key))
      throw new Error(`Unknown prompt placeholder: ${key}`);
    return values[key];
  });

export const recommendedGenerationSectionIds = (
  catalog: PuckGenerationCatalog,
  availableComponentNames: string[]
): string[] =>
  [...new Set(catalog.puckOptions.defaultGenerationSectionIds ?? [])].filter(
    (sectionId) =>
      availableComponentNames.includes(sectionId) &&
      catalog.data.components[sectionId]?.generation &&
      !catalog.data.components[sectionId].nestedOnly &&
      catalog.data.components[sectionId].permissions?.insert !== false
  );

/** Combine ALPHA-owned instructions with editor-owned runtime context. */
export const buildGenerationPrompt = (
  prompts: GenerationPromptBundle,
  catalog: PuckGenerationCatalog,
  availableComponentNames = Object.keys(catalog.data.components).filter(
    (name) => catalog.data.components[name].generation
  ),
  locales: string[] = [],
  workflow: "create" | "fullPageUpdate" = "create"
): string => {
  const defaultSectionIds = recommendedGenerationSectionIds(
    catalog,
    availableComponentNames
  );
  const hasSlottedItemSource = availableComponentNames.some(
    (name) => catalog.data.components[name]?.generation?.slottedItemSource
  );
  const isFullPageUpdate = workflow === "fullPageUpdate";
  const components = Object.entries(catalog.data.components).filter(
    ([name, component]) =>
      component.generation && availableComponentNames.includes(name)
  );
  const componentDescriptions = Object.fromEntries(
    components.map(([name, component]) => {
      const defaults = extractAuthored(
        catalog,
        { content: [{ type: name, props: component.defaultProps ?? {} }] },
        { includeIds: false }
      ).content[0].props;
      return [
        name,
        {
          description: component.description,
          defaults: isFullPageUpdate ? { styles: defaults.styles } : defaults,
          ...(component.generation?.slottedItemSource
            ? {
                slottedItemSource: {
                  cardType: component.generation.slottedItemSource.cardType,
                  defaultManualItems:
                    (component.defaultProps?.data as any)?.constantValue
                      ?.length ?? 0,
                },
              }
            : {}),
          nestedOnly: component.nestedOnly ?? false,
        },
      ];
    })
  );
  const template =
    workflow === "fullPageUpdate"
      ? prompts.prompts.fullPageUpdate
      : prompts.prompts.create;
  return renderPrompt(template, {
    componentNames: components.map(([name]) => name).join(", "),
    locales: JSON.stringify(locales),
    componentDescriptions: JSON.stringify(componentDescriptions),
    recommendedSections: defaultSectionIds.length
      ? renderPrompt(
          workflow === "fullPageUpdate"
            ? prompts.context.fullPageUpdateRecommendations
            : prompts.context.createRecommendations,
          { sectionIds: JSON.stringify(defaultSectionIds) }
        )
      : "",
    listGuidance: hasSlottedItemSource
      ? workflow === "fullPageUpdate"
        ? prompts.context.fullPageUpdateLists
        : prompts.context.createLists
      : "",
  });
};
