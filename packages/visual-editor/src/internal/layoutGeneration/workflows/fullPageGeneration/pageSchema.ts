import { z } from "zod";
import type { PuckGenerationCatalog } from "../../../../utils/createPuckGenerationCatalog.ts";
import { translationModeGuidance } from "../../schemaGuidance.ts";
import { createGenerationSchemaCompiler } from "../../schema/compiler.ts";
import {
  extractAuthored,
  rejectZones,
  type Content,
} from "../../shared/authoredValues.ts";
import { finalizeGeneratedContent } from "../../shared/finalizeGeneratedContent.ts";
import { isLinkedSource } from "../../shared/slottedItemSource.ts";
import { CreationStream } from "./creationStream.ts";
import { isBlankGenerationPage } from "./isBlankGenerationPage.ts";
import type { GenerationPreparation } from "./preparationContracts.ts";

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
    createGenerationSchemaCompiler(catalog, locales, "create");
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
  const identities = new Map<string, string>();
  const materialize = (
    response: any,
    partial = false
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
    const observedCollections: {
      componentType: string;
      instanceIndex: number;
      count: number;
      linked: boolean;
    }[] = [];
    finalizeGeneratedContent(catalog, candidate, {
      locales,
      translationMode: parsed.translationMode,
      explicitCardLists,
      onPrepared: (component) => {
        const counts = cardCounts.get(component.type);
        if (components[component.type].generation?.slottedItemSource) {
          const instanceIndex = instanceCounts.get(component.type) ?? 0;
          instanceCounts.set(component.type, instanceIndex + 1);
          const linked = isLinkedSource(component.props);
          observedCollections.push({
            componentType: component.type,
            instanceIndex,
            count: component.props.slots.CardSlot.length,
            linked,
          });
          const count =
            counts?.get(instanceIndex) ??
            (!linked ? counts?.get(null) : undefined);
          if (count !== undefined) {
            if (linked || component.props.slots.CardSlot.length !== count) {
              throw new Error(
                `${component.type} instance ${instanceIndex}: expected ${count} manual CardSlot children. Author cards inside slots.CardSlot, not data.mappings or repeated sections.`
              );
            }
            preparation!.cardCounts.forEach((requirement, index) => {
              if (
                requirement.componentType === component.type &&
                requirement.instanceIndex === instanceIndex
              ) {
                matchedCounts.add(index);
              }
            });
          }
        }
      },
      assignId: (component, path) => {
        let id = identities.get(path);
        if (!id) {
          id =
            component.type === "MainContent" &&
            currentData.content[0]?.type === "MainContent"
              ? (currentData.content[0].props.id as string)
              : `generated-${globalThis.crypto.randomUUID()}`;
          identities.set(path, id);
        }
        return id;
      },
    });
    // General counts constrain existing manual collections, not section selection.
    // Only an explicit occurrence requires an owner to be present in the page.
    const unmatchedRequirements = (preparation?.cardCounts ?? []).filter(
      (requirement, index) =>
        requirement.instanceIndex !== null && !matchedCounts.has(index)
    );
    if (!partial && unmatchedRequirements.length) {
      throw new Error(
        `Generated page omitted a prepared manual card collection. Unmatched requirements: ${JSON.stringify(unmatchedRequirements)}. Observed collections: ${JSON.stringify(observedCollections)}.`
      );
    }
    return { text: parsed.text, spec: candidate };
  };
  return {
    jsonSchema,
    isBlankPage: true,
    availableComponentNames,
    context: { locales, layout: extractAuthored(catalog, currentData) },
    materialize,
    stream: (onContent: (content: Content) => Promise<void>) => {
      let previous = "";
      const parser = new CreationStream(async (path, value) => {
        const rootSection =
          path.length === 3 && path[0] === "result" && path[1] === "content";
        const mainSection =
          path.length === 6 &&
          path[0] === "result" &&
          path[1] === "content" &&
          path[3] === "props" &&
          path[4] === "content" &&
          parser.value.result.content[path[2]].type === "MainContent";
        if (!rootSection && !mainSection) {
          return;
        }
        // A complete section must pass its own wire contract even when its
        // enclosing scaffold still needs properties from later in the stream.
        element(value.type).wire.parse(value);
        const parsed = responseSchema.safeParse(parser.value);
        if (!parsed.success) {
          return;
        }
        const result = materialize(parsed.data, true);
        if (!result.spec) {
          return;
        }
        const serialized = JSON.stringify(result.spec);
        if (serialized === previous) {
          return;
        }
        await onContent(result.spec);
        previous = serialized;
      });
      return parser;
    },
    parseResponse: (text: string) => materialize(JSON.parse(text)),
  };
};
