import { translationModeGuidance } from "./prompts.ts";
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
  generationFields,
} from "../../internal/generation/slottedItemSource.ts";

import { isBlankGenerationPage } from "../../internal/generation/isBlankGenerationPage.ts";
import { normalizeGeneratedText } from "./localizedText.ts";
import type { GenerationPreparation } from "../../internal/generation/editProtocol.ts";
import { isLinkedSource } from "../../internal/generation/slottedItemSource.ts";

/** Compile creation contracts without editing operations or model-authored identities. */
export const compileGenerationSchema = (
  catalog: PuckGenerationCatalog,
  locales: string[],
  currentData: Content = { content: [] },
  preparation?: GenerationPreparation
) => {
  rejectZones(currentData);
  if (!isBlankGenerationPage(currentData)) {
    throw new Error(
      "Generation requires a blank page. Clear the layout before generating a new page."
    );
  }
  const components = catalog.data.components;
  if (
    preparation?.question ||
    (preparation && preparation.translationMode === null)
  ) {
    throw new Error(
      "Resolve the preparation question before generating page content."
    );
  }
  const cardCounts = new Map<string, Map<number | null, number>>();
  for (const requirement of preparation?.cardCounts ?? []) {
    const counts =
      cardCounts.get(requirement.componentType) ??
      new Map<number | null, number>();
    if (
      !components[requirement.componentType]?.generation?.slottedItemSource ||
      counts.has(requirement.instanceIndex)
    ) {
      throw new Error("Invalid prepared card collection requirement.");
    }
    counts.set(requirement.instanceIndex, requirement.count);
    cardCounts.set(requirement.componentType, counts);
  }
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
    translationMode: z
      .enum(["defaultOnly", "translate"])
      .describe(translationModeGuidance),
    result: union(outcomes),
  });
  const jsonSchema = exportSchema(responseSchema);
  // The root schema already validates reachable contracts. Export only the
  // unreachable contracts separately, avoiding repeated exports of the graph.
  const reachable = new Set(availableComponentNames);
  for (const [name, config] of Object.entries(components)) {
    if (config.generation && !reachable.has(name)) {
      exportSchema(z.strictObject({ component: element(name).wire }));
    }
  }
  const materialize = (
    response: any
  ): { text: string; spec: Content | null } => {
    const parsed = responseSchema.parse(response) as any;
    if (preparation && parsed.translationMode !== preparation.translationMode) {
      throw new Error(
        "Generated translation mode differs from the prepared choice."
      );
    }
    if (parsed.result.action === "clarification") {
      return {
        text: parsed.result.question,
        spec: null,
      };
    }
    const candidate = {
      content: parsed.result.content.map((input: any) =>
        element(input.type).apply(input, undefined)
      ),
    };
    const instanceCounts = new Map<string, number>();
    const matchedCounts = new Set<number>();
    // Prepare defaults while descending so every newly created card is visited.
    walkAuthored(catalog, candidate, ({ component }) => {
      prepareSlottedSource(
        component,
        components[component.type],
        explicitCardLists.has(component)
      );
      const counts = cardCounts.get(component.type);
      if (counts) {
        const instanceIndex = instanceCounts.get(component.type) ?? 0;
        instanceCounts.set(component.type, instanceIndex + 1);
        const linked = isLinkedSource(component.props);
        const count =
          counts.get(instanceIndex) ?? (!linked ? counts.get(null) : undefined);
        if (count !== undefined) {
          if (linked || component.props.slots.CardSlot.length !== count) {
            throw new Error(
              `${component.type} instance ${instanceIndex}: expected ${count} manual CardSlot children. Author cards inside slots.CardSlot, not data.mappings or repeated sections.`
            );
          }
          preparation!.cardCounts.forEach((requirement, index) => {
            if (
              requirement.componentType === component.type &&
              (requirement.instanceIndex === null ||
                requirement.instanceIndex === instanceIndex)
            ) {
              matchedCounts.add(index);
            }
          });
        }
      }
      const config = components[component.type];
      component.props = normalizeGeneratedText(
        component.props,
        config.generation!.props,
        { type: "object", objectFields: generationFields(config) },
        parsed.translationMode === "translate",
        locales
      );
      component.props.id = `generated-${globalThis.crypto.randomUUID()}`;
    });
    if (matchedCounts.size !== (preparation?.cardCounts.length ?? 0)) {
      throw new Error(
        "Generated page omitted a prepared manual card collection."
      );
    }
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
    context: { locales, layout: extractAuthored(catalog, currentData) },
    materialize,
    parseResponse: (text: string) => materialize(JSON.parse(text)),
  };
};
