import { z } from "zod";
import type { PuckGenerationCatalog } from "../../../../utils/createPuckGenerationCatalog.ts";
import {
  buildGenerationPrompt,
  translationModeGuidance,
} from "../../prompts.ts";
import { deduplicateGenerationDefinitions } from "../../schema/compactSchema.ts";
import { createGenerationSchemaCompiler } from "../../schema/compiler.ts";
import {
  clone,
  extractAuthored,
  validateAuthored,
  walkAuthored,
  type Content,
  type SavedComponent,
} from "../../shared/authoredValues.ts";
import { normalizeGeneratedText } from "../../shared/localizedText.ts";
import {
  finalizeSlottedSource,
  generationFields,
  prepareSlottedSource,
} from "../../shared/slottedItemSource.ts";
import { buildEditInventory } from "../edits/buildEditInventory.ts";
import { CreationStream } from "../fullPageGeneration/creationStream.ts";
import {
  regenerationAnchorSchema,
  regenerationCollectionSchema,
  type RegenerationStep,
} from "./contracts.ts";

export const compileRegenerationSchema = (
  catalog: PuckGenerationCatalog,
  locales: string[],
  currentData: Content
) => {
  validateAuthored(catalog, currentData);
  const inventory = buildEditInventory(catalog, currentData);
  const { element, union, exportSchema, nodes, explicitCardLists } =
    createGenerationSchemaCompiler(catalog, locales, "insert", {
      requireExplicitContent: true,
    });
  // Compile every available section, including those not present on the page.
  const sections = Object.entries(catalog.data.components)
    .filter(
      ([name, config]) =>
        name !== "MainContent" &&
        config.generation &&
        !config.nestedOnly &&
        config.permissions?.insert !== false
    )
    .map(([name]) => element(name).wire);
  const sectionId = z.string().min(1);
  const alternatives: z.ZodType[] = [
    z.strictObject({ kind: z.literal("keep"), sectionId }),
    z.strictObject({ kind: z.literal("remove"), sectionId }),
    z.strictObject({
      kind: z.literal("reorder"),
      sectionId,
      anchor: regenerationAnchorSchema,
    }),
  ];
  if (sections.length) {
    const content = z.array(union(sections)).min(1);
    alternatives.push(
      z.strictObject({
        kind: z.literal("replace"),
        sectionId,
        sections: content,
      }),
      z.strictObject({
        kind: z.literal("insert"),
        collection: regenerationCollectionSchema,
        anchor: regenerationAnchorSchema,
        sections: content,
      })
    );
  }
  const stepSchema = union(alternatives);
  const responseSchema = z.strictObject({
    translationMode: z
      .enum(["defaultOnly", "translate"])
      .describe(translationModeGuidance),
    result: z.union([
      z.strictObject({
        action: z.literal("clarification"),
        question: z.string().min(1),
      }),
      z.strictObject({
        action: z.literal("regenerate"),
        steps: z.array(stepSchema),
      }),
    ]),
    text: z.string(),
  });
  const jsonSchema = deduplicateGenerationDefinitions(
    exportSchema(responseSchema)
  );
  const availableComponentNames = [...nodes.keys()].sort();
  // Compilation for scaffold/default guidance must not add it to the insertion union.
  for (const [name, config] of Object.entries(catalog.data.components)) {
    if (config.generation && !nodes.has(name))
      exportSchema(z.strictObject({ component: element(name).wire }));
  }
  const cache = new Map<number, { wire: string; step: RegenerationStep }>();
  const materialize = (
    input: unknown,
    index: number,
    translationMode: "defaultOnly" | "translate"
  ): RegenerationStep => {
    const step = stepSchema.parse(input) as any;
    const wire = JSON.stringify({ translationMode, step });
    const previous = cache.get(index);
    if (previous) {
      if (previous.wire !== wire)
        throw new Error("Regeneration changed an already streamed step.");
      return clone(previous.step);
    }
    if (step.sections) {
      const candidate: Content = {
        content: step.sections.map((section: any) =>
          element(section.type).apply(section, undefined)
        ),
      };
      const sources: SavedComponent[] = [];
      walkAuthored(catalog, candidate, ({ component }) => {
        const config = catalog.data.components[component.type];
        prepareSlottedSource(
          component,
          config,
          explicitCardLists.has(component)
        );
        component.props = normalizeGeneratedText(
          component.props,
          config.generation!.props,
          { type: "object", objectFields: generationFields(config) },
          translationMode === "translate",
          locales
        );
        component.props.id = `generated-${crypto.randomUUID()}`;
        if (config.generation?.slottedItemSource) sources.push(component);
      });
      for (const source of sources)
        finalizeSlottedSource(source, catalog.data.components[source.type]);
      for (const source of sources.reverse())
        finalizeSlottedSource(source, catalog.data.components[source.type]);
      validateAuthored(catalog, candidate);
      step.sections = candidate.content;
    }
    cache.set(index, { wire, step });
    return clone(step);
  };
  return {
    jsonSchema,
    isBlankPage: false,
    availableComponentNames,
    context: {
      locales,
      layout: extractAuthored(catalog, currentData),
      inventory: {
        components: inventory.components
          .filter(
            (item) =>
              item.sectionId === item.componentId || item.type === "MainContent"
          )
          .map(
            ({
              componentId,
              type,
              sectionId,
              collection,
              position,
              editable,
              canRemove,
              canReorder,
            }) => ({
              componentId,
              type,
              sectionId,
              collection,
              position,
              editable,
              canRemove,
              canReorder,
            })
          ),
        collections: inventory.collections.filter(
          (collection) =>
            collection.ownerId === null ||
            (collection.slotPath === "/content" &&
              inventory.components.some(
                (item) =>
                  item.componentId === collection.ownerId &&
                  item.type === "MainContent"
              ))
        ),
      },
    },
    instructions: buildGenerationPrompt(
      catalog,
      [...nodes.keys()],
      locales,
      "regenerate"
    ),
    streamRegeneration: (
      onStep: (step: RegenerationStep, index: number) => Promise<void>
    ) => {
      const parser = new CreationStream(async (path, value) => {
        if (path.length !== 3 || path[0] !== "result" || path[1] !== "steps")
          return;
        if (parser.value.result.action !== "regenerate")
          throw new Error("Expected regeneration action before steps.");
        const translationMode = z
          .enum(["defaultOnly", "translate"])
          .parse(parser.value.translationMode);
        await onStep(
          materialize(value, path[2] as number, translationMode),
          path[2] as number
        );
      });
      return parser;
    },
    parseResponse: (text: string) => {
      const parsed = responseSchema.parse(JSON.parse(text)) as any;
      if (parsed.result.action === "clarification") {
        if (cache.size)
          throw new Error("Clarification cannot follow streamed changes.");
        return { text: parsed.text, result: parsed.result };
      }
      if (cache.size > parsed.result.steps.length)
        throw new Error("Regeneration omitted streamed steps.");
      return {
        text: parsed.text,
        result: {
          action: "regenerate" as const,
          steps: parsed.result.steps.map((step: unknown, index: number) =>
            materialize(step, index, parsed.translationMode)
          ),
        },
      };
    },
  };
};
