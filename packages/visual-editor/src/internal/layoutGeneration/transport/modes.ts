import { z } from "zod";
import { compileEditPlanningSchema } from "../workflows/edits/sectionEditPlanningSchema.ts";
import {
  sectionEditPlanSchema,
  sectionEditResultSchema,
} from "../workflows/edits/sectionEditTaskSchema.ts";
import { compileSectionEditSchema } from "../workflows/edits/compileSectionEditSchema.ts";
import { compileFullPageUpdateSchema } from "../workflows/fullPageUpdate/pageSchema.ts";
import {
  fullPageUpdateResultSchema,
  type FullPageUpdateStep,
} from "../workflows/fullPageUpdate/contracts.ts";
import { compileGenerationSchema } from "../workflows/fullPageGeneration/pageSchema.ts";
import { compileGenerationPreparation } from "../workflows/fullPageGeneration/preparation.ts";
import { generationPreparationSchema } from "../workflows/fullPageGeneration/preparationContracts.ts";
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
  localResult?: object;
  parseResponse: (text: string) => object;
  streamFullPageUpdate?: (
    onStep: (step: FullPageUpdateStep, index: number) => Promise<void>,
    onSection?: (sectionId: string) => Promise<void>
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
  if (mode === "fullPageUpdate") {
    return compileFullPageUpdateSchema(
      catalog,
      locales,
      currentData as Content
    );
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
  (mode === "fullPageUpdate"
    ? z.strictObject({
        type: z.literal("fullPageUpdated"),
        text: z.string(),
        result: fullPageUpdateResultSchema,
      })
    : mode === "prepare"
      ? preparedSchema
      : mode === "plan"
        ? planSchema
        : mode === "section"
          ? resultSchema
          : acceptedSchema
  ).parse(event);
