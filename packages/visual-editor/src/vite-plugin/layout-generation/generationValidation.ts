import { extractAuthored } from "../../internal/generation/authored.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";

export const buildGenerationPrompt = (
  catalog: PuckGenerationCatalog,
  availableComponentNames = Object.keys(catalog.data.components).filter(
    (name) => catalog.data.components[name].generation
  )
): string =>
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
                content: [{ type: name, props: component.defaultProps ?? {} }],
              },
              { includeIds: false }
            ).content[0].props,
            nestedOnly: component.nestedOnly ?? false,
          },
        ])
    )
  );
