import { translationDecisionGuidance } from "./translationPolicy.ts";
import { z } from "zod";
import { generationPreparationSchema } from "../../internal/generation/editProtocolSchema.ts";
import type { PuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import { exportGenerationSchema } from "./strictGenerationSchema.ts";

/** A small decision request runs before the expensive component-schema compiler. */
export const compileGenerationPreparation = (
  catalog: PuckGenerationCatalog,
  locales: string[]
) => {
  const cardSources = Object.entries(catalog.data.components).flatMap(
    ([componentType, config]) =>
      config.generation?.slottedItemSource
        ? [
            {
              componentType,
              cardType: config.generation.slottedItemSource.cardType,
            },
          ]
        : []
  );
  const names = cardSources.map((source) => source.componentType);
  const schema = generationPreparationSchema.extend({
    cardCounts: names.length
      ? z.array(
          generationPreparationSchema.shape.cardCounts.element.extend({
            componentType: z.enum(names),
          })
        )
      : z.array(z.string()).max(0),
  });
  return {
    jsonSchema: exportGenerationSchema(schema),
    context: { locales, cardSources },
    availableComponentNames: names,
    isBlankPage: true,
    instructions: [
      "Prepare a fresh page request. Do not generate page content, copy, props or layouts. Return only the small decision schema.",
      translationDecisionGuidance,
      "When asking, set question to the user-facing question and translationMode to null. Otherwise set question null and the resolved translationMode.",
      "Record explicitly requested card counts for the supplied cardSources. 'Three cards in each card section' means count 3 for each applicable manual card collection, not three copies of each section. Use the collection's componentType, not the child cardType. Set instanceIndex to the zero-based occurrence of that componentType in depth-first page order, including entity-linked instances. Use null only when the requested count applies to every manual instance of that type; an explicit index overrides that general count. Record separate entries when instances need different counts. Do not invent counts when none were requested. Do not constrain lists explicitly requested to stay entity-linked; their visible records come from entity data.",
    ].join("\n"),
    parseResponse: (text: string) => {
      const preparation = generationPreparationSchema.parse(
        schema.parse(JSON.parse(text))
      );
      if (
        (preparation.question === null) ===
        (preparation.translationMode === null)
      ) {
        throw new Error(
          "Preparation must either ask a question or resolve translation mode."
        );
      }
      if (
        new Set(
          preparation.cardCounts.map((item) =>
            JSON.stringify([item.componentType, item.instanceIndex])
          )
        ).size !== preparation.cardCounts.length
      ) {
        throw new Error(
          "Preparation contains duplicate card count requirements."
        );
      }
      return { preparation };
    },
  };
};
