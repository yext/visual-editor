import { z } from "zod";

export type GenerationPreparation = {
  question: string | null;
  translationMode: "defaultOnly" | "translate" | null;
  cardCounts: {
    componentType: string;
    /**
     * Zero-based occurrence of this type in depth-first page order, including
     * linked instances; null means every manual instance.
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
      instanceIndex: z.number().int().min(0).nullable(),
      count: z.number().int().min(0),
    })
  ),
});
