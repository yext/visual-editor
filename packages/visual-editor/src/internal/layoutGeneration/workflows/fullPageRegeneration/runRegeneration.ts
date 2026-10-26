import type { GenerationTurn } from "../../shared/contracts.ts";
import {
  GenerationError,
  repairGenerationOutput,
} from "../../shared/generationErrors.ts";
import type { RegenerationStep } from "./contracts.ts";

type RegenerationCanvas = {
  beginRegeneration: () => void;
  applyRegeneration: (
    step: RegenerationStep,
    index: number,
    signal: AbortSignal
  ) => Promise<void>;
  finishRegeneration: () => void;
};

/** A single full-page request streams complete section decisions, never field patches. */
export const runRegeneration = async ({
  layoutId,
  currentData,
  messages,
  signal,
  active,
  request,
  canvas,
  onProgress,
}: GenerationTurn & {
  canvas: RegenerationCanvas;
  onProgress: (step: RegenerationStep, completedSteps: number) => void;
}) => {
  canvas.beginRegeneration();
  let applied = 0;
  const apply = async (step: RegenerationStep, index: number) => {
    if (!active()) return;
    await canvas.applyRegeneration(step, index, signal);
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
            mode: "regenerate",
            layoutId,
            currentData,
            messages,
            validationFeedback,
          },
          signal,
          undefined,
          apply
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
    if (event.type !== "regenerated")
      throw new Error("Expected page regeneration output.");
    if (event.result.action === "clarification") {
      if (applied)
        throw new Error(
          "Clarification cannot follow applied regeneration steps."
        );
      return { text: event.result.question, clarification: true };
    }
    for (let index = 0; index < event.result.steps.length; index++) {
      if (!active()) return;
      if (index >= applied) await apply(event.result.steps[index], index);
    }
    return { text: event.text, clarification: false };
  } finally {
    if (active()) canvas.finishRegeneration();
  }
};
