import { z } from "zod";
import { compileEditPlanningSchema } from "../workflows/edits/sectionEditPlanningSchema.ts";
import {
  sectionEditPlanSchema,
  sectionEditResultSchema,
} from "../workflows/edits/sectionEditTaskSchema.ts";
import { compileSectionEditSchema } from "../workflows/edits/compileSectionEditSchema.ts";
import { compileRegenerationSchema } from "../workflows/fullPageRegeneration/pageSchema.ts";
import {
  regenerationResultSchema,
  type RegenerationStep,
} from "../workflows/fullPageRegeneration/contracts.ts";
import { compileGenerationSchema } from "../workflows/fullPageGeneration/pageSchema.ts";
import { compileGenerationPreparation } from "../workflows/fullPageGeneration/preparation.ts";
import { generationPreparationSchema } from "../workflows/fullPageGeneration/preparationContracts.ts";
import { editPlanningPrompt, sectionEditPrompt } from "../prompts.ts";
import type { Content } from "../shared/authoredValues.ts";
import type {
  GenerationEnvironment,
  GenerationResult,
  LayoutGenerationRequest,
} from "../shared/contracts.ts";
import type { ValidatedGenerationRequest } from "./requestValidation.ts";

export type CompiledGenerationRequest = {
  jsonSchema: Record<string, any>;
  context: unknown;
  availableComponentNames: string[];
  isBlankPage: boolean;
  instructions?: string;
  localResult?: object;
  parseResponse: (text: string) => object;
  streamRegeneration?: (
    onStep: (step: RegenerationStep, index: number) => Promise<void>
  ) => {
    write: (delta: string) => Promise<void>;
    finish: () => void;
  };
  stream?: (onContent: (content: Content) => Promise<void>) => {
    write: (delta: string) => Promise<void>;
    finish: () => void;
  };
};

export const compileGenerationRequest = (
  { mode, context, currentData }: ValidatedGenerationRequest,
  catalog: GenerationEnvironment["catalog"],
  locales: string[]
): CompiledGenerationRequest => {
  if (mode === "regenerate") {
    return compileRegenerationSchema(catalog, locales, currentData as Content);
  } else if (mode === "prepare") {
    return compileGenerationPreparation(catalog, locales);
  } else if (mode === "plan") {
    const planner = compileEditPlanningSchema(
      catalog,
      locales,
      currentData as Content,
      context.selectedComponentId
    );
    return {
      ...planner,
      isBlankPage: false,
      instructions: editPlanningPrompt,
      parseResponse: (text) => ({ plan: planner.parseResponse(text) }),
    };
  } else if (mode === "section") {
    const section = compileSectionEditSchema(
      catalog,
      locales,
      currentData as Content,
      context.task!,
      context.sharedIntent
    );
    return {
      ...section,
      isBlankPage: false,
      instructions: sectionEditPrompt,
      localResult: section.localResult
        ? { result: section.localResult }
        : undefined,
      parseResponse: (text) => ({ result: section.parseResponse(text) }),
    };
  } else {
    return compileGenerationSchema(
      catalog,
      locales,
      currentData as Content | undefined,
      context.preparation
    );
  }
};
const acceptedSchema = z.strictObject({
  type: z.literal("accepted"),
  text: z.string(),
  spec: z.strictObject({ content: z.array(z.any()) }).nullable(),
});
const preparedSchema = z.strictObject({
  type: z.literal("prepared"),
  preparation: generationPreparationSchema,
});
const planSchema = z.strictObject({
  type: z.literal("planned"),
  plan: sectionEditPlanSchema,
});
const resultSchema = z.strictObject({
  type: z.literal("section-result"),
  result: sectionEditResultSchema,
});
export const parseGenerationResult = (
  event: unknown,
  mode: LayoutGenerationRequest["mode"]
): GenerationResult =>
  (mode === "regenerate"
    ? z.strictObject({
        type: z.literal("regenerated"),
        text: z.string(),
        result: regenerationResultSchema,
      })
    : mode === "prepare"
      ? preparedSchema
      : mode === "plan"
        ? planSchema
        : mode === "section"
          ? resultSchema
          : acceptedSchema
  ).parse(event);
