import { z } from "zod";

export type GenerationPreparation = {
  question: string | null;
  translationMode: "defaultOnly" | "translate" | null;
  cardCounts: {
    componentType: string;
    /**
     * Zero-based occurrence of this type in depth-first page order, including
     * linked instances; an explicit index requires that owner to exist.
     * null constrains every existing manual instance without requiring the type.
     */
    instanceIndex: number | null;
    count: number;
  }[];
};

const id = z.string().trim().min(1);
export const generationPreparationSchema = z.strictObject({
  question: z.string().trim().min(1).nullable(),
  translationMode: z.enum(["defaultOnly", "translate"]).nullable(),
  cardCounts: z.array(
    z.strictObject({
      componentType: id,
      instanceIndex: z
        .number()
        .int()
        .min(0)
        .nullable()
        .describe(
          "Zero-based occurrence of this componentType in depth-first page order, including linked instances. An explicit index requires that owner to exist. null applies to existing manual instances without requiring the type to appear."
        ),
      count: z.number().int().min(0),
    })
  ),
});
