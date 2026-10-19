import { extractAuthored } from "../../internal/generation/authored.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import {
  translationModeGuidance,
  newTextGuidance,
  translationDecisionGuidance,
  layoutLocalesLabel,
  preparationGuidance,
  defaultComponentsLabel,
  defaultComponentsGuidance,
  componentDescriptionsLabel,
  slottedItemSourceGuidance,
} from "./prompts.ts";

/** Compose fresh generation instructions with available components and defaults. */
export const buildGenerationPrompt = (
  catalog: PuckGenerationCatalog,
  availableComponentNames = Object.keys(catalog.data.components).filter(
    (name) => catalog.data.components[name].generation
  ),
  locales: string[] = []
): string => {
  const defaultComponentIds = [
    ...new Set(catalog.puckOptions.defaultGenerationComponentIds ?? []),
  ].filter(
    (componentId) =>
      availableComponentNames.includes(componentId) &&
      catalog.data.components[componentId]?.generation
  );
  const hasSlottedItemSource = availableComponentNames.some(
    (name) => catalog.data.components[name]?.generation?.slottedItemSource
  );
  return (
    catalog.schema
      .createCatalog({
        components: Object.fromEntries(
          Object.entries(catalog.data.components).filter(
            ([name, component]) =>
              component.generation && availableComponentNames.includes(name)
          )
        ),
      })
      .prompt() +
    "\n" +
    [
      translationModeGuidance,
      newTextGuidance,
      translationDecisionGuidance,
    ].join("\n") +
    layoutLocalesLabel +
    JSON.stringify(locales) +
    "\n" +
    preparationGuidance +
    (defaultComponentIds.length
      ? defaultComponentsLabel +
        JSON.stringify(defaultComponentIds) +
        defaultComponentsGuidance
      : "") +
    (hasSlottedItemSource ? "\n" + slottedItemSourceGuidance + "\n" : "") +
    componentDescriptionsLabel +
    JSON.stringify(
      Object.fromEntries(
        Object.entries(catalog.data.components)
          .filter(
            ([name, component]) =>
              component.generation && availableComponentNames.includes(name)
          )
          .map(([name, component]) => [
            name,
            {
              description: component.description,
              defaults: extractAuthored(
                catalog,
                {
                  content: [
                    { type: name, props: component.defaultProps ?? {} },
                  ],
                },
                { includeIds: false }
              ).content[0].props,
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
          ])
      )
    )
  );
};
