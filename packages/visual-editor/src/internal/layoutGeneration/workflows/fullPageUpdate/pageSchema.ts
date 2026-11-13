import { z } from "zod";
import type { PuckGenerationCatalog } from "../../../../utils/createPuckGenerationCatalog.ts";
import { translationModeGuidance } from "../../schemaGuidance.ts";
import { deduplicateGenerationDefinitions } from "../../schema/compactSchema.ts";
import { createGenerationSchemaCompiler } from "../../schema/compiler.ts";
import {
  clone,
  extractAuthored,
  validateAuthored,
  walkAuthored,
  type Content,
} from "../../shared/authoredValues.ts";
import { finalizeGeneratedContent } from "../../shared/finalizeGeneratedContent.ts";
import { buildEditInventory } from "../edits/buildEditInventory.ts";
import { CreationStream } from "../fullPageGeneration/creationStream.ts";
import {
  fullPageUpdateAnchorSchema,
  fullPageUpdateCollectionSchema,
  type FullPageUpdateStep,
} from "./contracts.ts";

/**
 * 1. Compile the available section schemas and inspect existing page collections.
 * 2. Restrict model insertions and replacements to each destination's permitted types.
 * 3. Materialize streamed sections and preserve their generated identities.
 * 4. Parse the complete response without changing already streamed steps.
 */
export const compileFullPageUpdateSchema = (
  catalog: PuckGenerationCatalog,
  locales: string[],
  currentData: Content
) => {
  validateAuthored(catalog, currentData);
  const inventory = buildEditInventory(catalog, currentData);
  const readOnlyContentIds = new Set<string>();
  walkAuthored(catalog, currentData, ({ component }) => {
    if (component.type === "MainContent" && component.readOnly?.content) {
      readOnlyContentIds.add(component.props.id);
    }
  });
  const collections = inventory.collections
    .filter(
      (collection) =>
        collection.ownerId === null ||
        (collection.slotPath === "/content" &&
          inventory.components.some(
            (item) =>
              item.componentId === collection.ownerId &&
              item.type === "MainContent"
          ))
    )
    .map((collection) =>
      collection.ownerId !== null && readOnlyContentIds.has(collection.ownerId)
        ? { ...collection, allowedInsertionTypes: [] }
        : collection
    );
  const { element, union, exportSchema, nodes, explicitCardLists } =
    createGenerationSchemaCompiler(catalog, locales, "insert", {
      requireExplicitContent: true,
    });
  // Compile every available section, including those not present on the page.
  const sections = new Map(
    Object.entries(catalog.data.components)
      .filter(
        ([name, config]) =>
          name !== "MainContent" &&
          config.generation &&
          !config.nestedOnly &&
          config.permissions?.insert !== false
      )
      .map(([name]) => [name, element(name).wire])
  );
  const existingSectionIds = inventory.components
    .filter((item) => item.componentId === item.sectionId)
    .map((item) => item.componentId);
  const sectionId = z.string().min(1);
  const removalSchema = z.strictObject({
    kind: z.literal("remove"),
    sectionId,
  });
  const alternatives: z.ZodType[] = [
    z.strictObject({ kind: z.literal("keep"), sectionId }),
    removalSchema,
    z.strictObject({
      kind: z.literal("reorder"),
      sectionId,
      anchor: fullPageUpdateAnchorSchema,
    }),
  ];
  // Keep runtime removal parsing tolerant so a missing target does not drop streamed work.
  const modelAlternatives = alternatives.flatMap((alternative) =>
    alternative === removalSchema
      ? existingSectionIds.length
        ? [removalSchema.extend({ sectionId: z.enum(existingSectionIds) })]
        : []
      : [alternative]
  );
  if (sections.size) {
    const content = z.array(union([...sections.values()])).min(1);
    const replacement = z.strictObject({
      kind: z.literal("replace"),
      sectionId,
      sections: content,
    });
    const insertion = z.strictObject({
      kind: z
        .literal("insert")
        .describe(
          "Add new sections where the requested intent needs content that the existing page does not cover. Section types may be absent from the existing layout."
        ),
      collection: fullPageUpdateCollectionSchema,
      anchor: fullPageUpdateAnchorSchema,
      sections: content,
    });
    alternatives.push(replacement, insertion);
    for (const collection of collections) {
      const allowed = collection.allowedInsertionTypes.filter((name) =>
        sections.has(name)
      );
      if (!allowed.length) {
        continue;
      }
      const permittedSections = z
        .array(union(allowed.map((name) => sections.get(name)!)))
        .min(1);
      modelAlternatives.push(
        insertion.extend({
          collection: z.strictObject({
            ownerId: z.literal(collection.ownerId),
            slotPath: z.literal(collection.slotPath),
          }),
          sections: permittedSections,
        })
      );
      const replacementIds = inventory.components
        .filter(
          (item) =>
            item.componentId === item.sectionId &&
            item.canRemove &&
            item.collection.ownerId === collection.ownerId &&
            item.collection.slotPath === collection.slotPath
        )
        .map((item) => item.componentId);
      if (replacementIds.length) {
        modelAlternatives.push(
          replacement.extend({
            sectionId: z.enum(replacementIds),
            sections: permittedSections,
          })
        );
      }
    }
  }
  const stepSchema = union(alternatives);
  const makeResponseSchema = (steps: z.ZodType) =>
    z.strictObject({
      translationMode: z
        .enum(["defaultOnly", "translate"])
        .describe(translationModeGuidance),
      result: z.union([
        z.strictObject({
          action: z.literal("clarification"),
          question: z.string().min(1),
        }),
        z.strictObject({
          action: z.literal("fullPageUpdate"),
          steps: z
            .array(steps)
            .describe(
              "Plan all section decisions before generating updated content. Emit all remove steps first, then explicit keep steps for every unchanged section, before any reorder, replace, or insert steps. The canvas is revealed after removals and keeps, before updates begin. Use surviving sections as anchors."
            ),
        }),
      ]),
      text: z.string(),
    });
  const responseSchema = makeResponseSchema(stepSchema);
  const modelStepSchema = union(modelAlternatives);
  const jsonSchema = deduplicateGenerationDefinitions(
    exportSchema(makeResponseSchema(modelStepSchema))
  );
  const availableComponentNames = [...nodes.keys()].sort();
  const cache = new Map<number, { wire: string; step: FullPageUpdateStep }>();
  const materialize = (
    input: unknown,
    index: number,
    translationMode: "defaultOnly" | "translate"
  ): FullPageUpdateStep => {
    const step = stepSchema.parse(input) as any;
    const wire = JSON.stringify({ translationMode, step });
    const previous = cache.get(index);
    if (previous) {
      if (previous.wire !== wire) {
        throw new Error(
          "The full-page update changed an already streamed step."
        );
      }
      return clone(previous.step);
    }
    if (step.sections) {
      const candidate: Content = {
        content: step.sections.map((section: any) =>
          element(section.type).apply(section, undefined)
        ),
      };
      // These are section fragments. applyFullPageUpdateStep validates them
      // in their destination collection after assembling the page.
      finalizeGeneratedContent(catalog, candidate, {
        locales,
        translationMode,
        explicitCardLists,
        assignId: () => `generated-${crypto.randomUUID()}`,
      });
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
        collections,
      },
    },
    streamFullPageUpdate: (
      onStep: (step: FullPageUpdateStep, index: number) => Promise<void>,
      onSection?: (sectionId: string) => Promise<void>
    ) => {
      const started = new Set<number>();
      const sectionIds = new Set(
        inventory.components
          .filter((item) => item.componentId === item.sectionId)
          .map((item) => item.sectionId)
      );
      const parser = new CreationStream(async (path, value) => {
        // Completed header fields identify a replacement before its content is complete.
        if (
          path.length === 4 &&
          path[0] === "result" &&
          path[1] === "steps" &&
          (path[3] === "kind" || path[3] === "sectionId")
        ) {
          const index = path[2] as number;
          const step = parser.value.result.steps[index];
          if (
            step.kind === "replace" &&
            sectionIds.has(step.sectionId) &&
            !started.has(index)
          ) {
            started.add(index);
            await onSection?.(step.sectionId);
          }
        }
        if (path.length !== 3 || path[0] !== "result" || path[1] !== "steps") {
          return;
        }
        if (parser.value.result.action !== "fullPageUpdate") {
          throw new Error("Expected full-page update action before steps.");
        }
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
        if (cache.size) {
          throw new Error("Clarification cannot follow streamed changes.");
        }
        return { text: parsed.text, result: parsed.result };
      }
      if (cache.size > parsed.result.steps.length) {
        throw new Error("The full-page update omitted streamed steps.");
      }
      return {
        text: parsed.text,
        result: {
          action: "fullPageUpdate" as const,
          steps: parsed.result.steps.map((step: unknown, index: number) =>
            materialize(step, index, parsed.translationMode)
          ),
        },
      };
    },
  };
};
