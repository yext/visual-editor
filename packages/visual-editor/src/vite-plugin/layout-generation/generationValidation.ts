import { extractAuthored } from "../../internal/generation/authored.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";

export const buildGenerationPrompt = (
  catalog: PuckGenerationCatalog,
  availableComponentNames = Object.keys(catalog.data.components).filter(
    (name) => catalog.data.components[name].generation
  )
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
                        "In manual mode author CardSlot children or select its default. References are assigned automatically. In linked mode author bindings and mappings, and leave CardSlot empty or select its default; cards use library defaults.",
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
