import { z } from "zod";
import type { PuckGenerationCatalog } from "../../../utils/generationCatalog.ts";
import { generationPreparationPrompt } from "../prompts.ts";
import { exportGenerationSchema } from "../schema/strictSchema.ts";
import { generationPreparationSchema } from "./preparationContracts.ts";

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
    instructions: generationPreparationPrompt,
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
