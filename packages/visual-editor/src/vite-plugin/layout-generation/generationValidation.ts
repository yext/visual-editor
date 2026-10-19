import {
  translationModeGuidance,
  newTextGuidance,
  translationDecisionGuidance,
} from "./translationPolicy.ts";
import { extractAuthored } from "../../internal/generation/authored.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";

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
    "\nLayout locales: " +
    JSON.stringify(locales) +
    "\n" +
    "\nIf preparation is supplied, its translationMode is the resolved choice and its cardCounts target componentType plus instanceIndex: a zero-based occurrence of that type in depth-first page order, including linked instances. A null instanceIndex applies to every manual instance of that type and excludes linked instances; an explicit index overrides this general count. Preserve each targeted instance and its requested count. Preserve the complete original page request after clarification replies. Put the requested number of child cards inside slots.CardSlot; never satisfy a card count by repeating its section. For manual cards put all item copy, images and translations on the card's child components. data.mappings belongs to entity-linked lists and does not create manual cards.\n" +
    (defaultComponentIds.length
      ? "\nDefault components for fresh generation: " +
        JSON.stringify(defaultComponentIds) +
        ". Include these components unless the user specifies otherwise. These are defaults, not requirements; explicit user requests take precedence. Follow the page structure and slot permissions when placing them.\n"
      : "") +
    "\nComponent descriptions and defaults:\n" +
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
                      instructions:
                        "In manual mode author CardSlot child components, one per requested card, or select its default only when the default count and content are appropriate. Item content goes on those child components, never in data.mappings. In linked mode author bindings and mappings, and leave CardSlot empty or select its default; cards use library defaults. References are assigned automatically.",
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
