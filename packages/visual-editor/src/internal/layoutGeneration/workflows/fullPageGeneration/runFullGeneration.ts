import type { Content } from "../../shared/authoredValues.ts";
import type {
  GenerationTurn,
  PageGenerationResult,
} from "../../shared/contracts.ts";
import {
  GenerationError,
  repairGenerationOutput,
} from "../../shared/generationErrors.ts";

type CreationCanvas = {
  beginCreation: () => void;
  revealCreation: (content: Content, signal: AbortSignal) => Promise<void>;
  finishCreation: () => void;
  readonly createdSectionCount: number;
};

type FullGenerationProgress =
  | { phase: "preparing" | "generating" }
  | { phase: "revealed"; sectionCount: number }
  | { phase: "applying"; candidate: Content | null }
  | { phase: "resolved" | "complete"; sectionCount: number };

/** Preparation resolves questions before one page request owns all creation reveals. */
export const runFullGeneration = async ({
  layoutId,
  currentData,
  messages,
  signal,
  active,
  request,
  canvas,
  onProgress,
}: GenerationTurn & {
  canvas: CreationCanvas;
  onProgress: (progress: FullGenerationProgress) => void;
}): Promise<PageGenerationResult | undefined> => {
  onProgress({ phase: "preparing" });
  const prepared = await repairGenerationOutput((validationFeedback) =>
    request({
      mode: "prepare",
      layoutId,
      currentData,
      messages,
      validationFeedback,
    })
  );
  if (!active()) {
    return;
  }
  if (prepared.type !== "prepared") {
    throw new Error("Expected page preparation output.");
  }
  if (prepared.preparation.question) {
    return { text: prepared.preparation.question, clarification: true };
  }

  onProgress({ phase: "generating" });
  canvas.beginCreation();
  let createdSections = 0;
  const reveal = async (content: Content) => {
    if (!active()) {
      return;
    }
    await canvas.revealCreation(content, signal);
    createdSections = canvas.createdSectionCount;
    onProgress({ phase: "revealed", sectionCount: createdSections });
  };
  const event = await repairGenerationOutput(async (validationFeedback) => {
    try {
      return await request(
        {
          mode: "create",
          layoutId,
          currentData,
          messages,
          preparation: prepared.preparation,
          validationFeedback,
        },
        signal,
        reveal
      );
    } catch (cause) {
      if (createdSections && cause instanceof GenerationError) {
        throw new GenerationError(
          cause.message,
          false,
          cause.transport,
          cause.feedback
        );
      }
      throw cause;
    }
  });
  if (!active()) {
    return;
  }
  if (event.type !== "accepted") {
    throw new Error("Expected fresh generation output.");
  }
  if (!event.spec) {
    if (createdSections) {
      throw new Error("Clarification cannot follow applied creation sections.");
    }
    return { text: event.text, clarification: true };
  }
  onProgress({ phase: "applying", candidate: event.spec });
  await canvas.revealCreation(event.spec, signal);
  createdSections = canvas.createdSectionCount;
  onProgress({ phase: "resolved", sectionCount: createdSections });
  canvas.finishCreation();
  if (active()) {
    onProgress({ phase: "complete", sectionCount: createdSections });
    return { text: event.text, clarification: false };
  }
};
