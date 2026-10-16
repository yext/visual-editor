import { z } from "zod";
import { createGenerationSchemaCompiler } from "./generationSchemaCompiler.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import {
  extractAuthored,
  rejectZones,
  validateAuthored,
  walkAuthored,
  type Content,
  type SavedComponent,
} from "../../internal/generation/authored.ts";

import {
  prepareSlottedSource,
  finalizeSlottedSource,
} from "../../internal/generation/slottedItemSource.ts";

import { isBlankGenerationPage } from "../../internal/generation/isBlankGenerationPage.ts";

/** Compile creation contracts without editing operations or model-authored identities. */
export const compileGenerationSchema = (
  catalog: PuckGenerationCatalog,
  locales: string[],
  currentData: Content = { content: [] }
) => {
  rejectZones(currentData);
  if (!isBlankGenerationPage(currentData)) {
    throw new Error(
      "Generation requires a blank page. Clear the layout before generating a new page."
    );
  }
  const components = catalog.data.components;
  const { element, union, exportSchema, nodes, explicitCardLists } =
    createGenerationSchemaCompiler(catalog, locales);
  const rootNodes = Object.keys(components)
    .filter(
      (name) =>
        components[name].generation &&
        !components[name].nestedOnly &&
        (!catalog.puckOptions.rootAllowedComponentIds ||
          catalog.puckOptions.rootAllowedComponentIds.includes(name))
    )
    .map(element);
  const availableComponentNames = [...nodes.keys()].sort();
  const outcomes: z.ZodType[] = [
    z.strictObject({
      action: z.literal("clarification"),
      question: z.string().min(1),
    }),
  ];
  if (rootNodes.length) {
    outcomes.push(
      z.strictObject({
        action: z.literal("create"),
        content: z.array(union(rootNodes.map((node) => node.wire))).min(1),
      })
    );
  }
  const responseSchema = z.strictObject({
    text: z.string(),
    result: union(outcomes),
  });
  const jsonSchema = exportSchema(responseSchema);
  // Preflight all registered contracts separately: unreachable components must
  // remain valid without inflating the request schema or prompt inventory.
  for (const [name, config] of Object.entries(components)) {
    if (config.generation) {
      exportSchema(z.strictObject({ component: element(name).wire }));
    }
  }
  const materialize = (
    response: any
  ): { text: string; spec: Content | null } => {
    const parsed = responseSchema.parse(response) as any;
    if (parsed.result.action === "clarification") {
      return {
        text: [parsed.text, parsed.result.question]
          .filter(Boolean)
          .join("\n\n"),
        spec: null,
      };
    }
    const candidate = {
      content: parsed.result.content.map((input: any) =>
        element(input.type).apply(input, undefined)
      ),
    };
    // Prepare defaults while descending so every newly created card is visited.
    walkAuthored(catalog, candidate, ({ component }) => {
      prepareSlottedSource(
        component,
        components[component.type],
        explicitCardLists.has(component)
      );
      component.props.id = `generated-${globalThis.crypto.randomUUID()}`;
    });
    // Parent-first finalization applies the helper's child identity convention.
    // Mirror copies must be taken after descendants have also finalized their references.
    const sources: SavedComponent[] = [];
    walkAuthored(catalog, candidate, ({ component }) => {
      if (components[component.type]?.generation?.slottedItemSource) {
        finalizeSlottedSource(component, components[component.type]);
        sources.push(component);
      }
    });
    for (const component of sources.reverse())
      finalizeSlottedSource(component, components[component.type]);
    validateAuthored(catalog, candidate);
    return { text: parsed.text, spec: candidate };
  };
  return {
    jsonSchema,
    isBlankPage: true,
    availableComponentNames,
    context: extractAuthored(catalog, currentData),
    materialize,
    parseResponse: (text: string) => materialize(JSON.parse(text)),
  };
};
