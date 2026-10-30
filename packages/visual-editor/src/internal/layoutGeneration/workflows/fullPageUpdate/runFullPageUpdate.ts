import type {
  GenerationTurn,
  PageGenerationResult,
} from "../../shared/contracts.ts";
import {
  GenerationError,
  repairGenerationOutput,
} from "../../shared/generationErrors.ts";
import type { FullPageUpdateStep } from "./contracts.ts";

type FullPageUpdateCanvas = {
  prepareFullPageUpdateSection?: (
    sectionId: string,
    signal: AbortSignal
  ) => Promise<void>;
  beginFullPageUpdate: () => void;
  applyFullPageUpdate: (
    step: FullPageUpdateStep,
    index: number,
    signal: AbortSignal
  ) => Promise<void>;
  finishFullPageUpdate: () => void;
};

/** A single full-page request streams complete section decisions, never field patches. */
export const runFullPageUpdate = async ({
  layoutId,
  currentData,
  messages,
  signal,
  active,
  request,
  canvas,
  onProgress,
}: GenerationTurn & {
  canvas: FullPageUpdateCanvas;
  onProgress: (step: FullPageUpdateStep, completedSteps: number) => void;
}): Promise<PageGenerationResult | undefined> => {
  canvas.beginFullPageUpdate();
  let applied = 0;
  const apply = async (step: FullPageUpdateStep, index: number) => {
    if (!active()) return;
    await canvas.applyFullPageUpdate(step, index, signal);
    if (index >= applied) {
      applied = index + 1;
      onProgress(step, applied);
    }
  };
  try {
    const event = await repairGenerationOutput(async (validationFeedback) => {
      try {
        return await request(
          {
            mode: "fullPageUpdate",
            layoutId,
            currentData,
            messages,
            validationFeedback,
          },
          signal,
          undefined,
          apply,
          async (sectionId) => {
            if (active())
              await canvas.prepareFullPageUpdateSection?.(sectionId, signal);
          }
        );
      } catch (cause) {
        if (applied && cause instanceof GenerationError)
          throw new GenerationError(
            cause.message,
            false,
            cause.transport,
            cause.feedback
          );
        throw cause;
      }
    });
    if (!active()) return;
    if (event.type !== "fullPageUpdated")
      throw new Error("Expected full-page update output.");
    if (event.result.action === "clarification") {
      if (applied)
        throw new Error(
          "Clarification cannot follow applied full-page update steps."
        );
      return { text: event.result.question, clarification: true };
    }
    for (let index = 0; index < event.result.steps.length; index++) {
      if (!active()) return;
      if (index >= applied) await apply(event.result.steps[index], index);
    }
    return { text: event.text, clarification: false };
  } finally {
    if (active()) canvas.finishFullPageUpdate();
  }
};
