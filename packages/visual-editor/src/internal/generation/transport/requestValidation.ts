import { z } from "zod";
import { sectionEditTaskSchema } from "../edits/sectionEditTaskSchema.ts";
import { isBlankGenerationPage } from "../full-generation/isBlankGenerationPage.ts";
import { generationPreparationSchema } from "../full-generation/preparationContracts.ts";
import { GENERATION_REPAIR_FEEDBACK_MAX_CHARACTERS } from "../limits.ts";
import type { Content } from "../shared/authoredValues.ts";
import type { LayoutGenerationRequest } from "../shared/contracts.ts";

/** Validate the envelope before mode-specific schema compilation. */
export const validateGenerationRequest = (
  payload: LayoutGenerationRequest,
  bodyBytes: number,
  rejectRequest: (message: string, status: number, details?: object) => never
) => {
  const messages =
    payload && typeof payload === "object" && "messages" in payload
      ? payload.messages
      : undefined;
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.some(
      (message) =>
        !message ||
        typeof message !== "object" ||
        (message.role !== "user" && message.role !== "assistant") ||
        typeof message.content !== "string" ||
        !message.content.trim()
    ) ||
    messages.at(-1)!.role !== "user"
  ) {
    return rejectRequest(
      "A conversation with user/assistant messages ending in a non-empty user message is required.",
      400,
      { bodyBytes }
    );
  }

  const layoutId =
    payload && typeof payload === "object" && "layoutId" in payload
      ? payload.layoutId
      : undefined;
  if (typeof layoutId !== "string" || !layoutId.trim()) {
    return rejectRequest("A layoutId is required.", 400);
  }

  const currentData =
    payload && typeof payload === "object" && "currentData" in payload
      ? payload.currentData
      : undefined;
  if (
    currentData !== undefined &&
    (!currentData ||
      typeof currentData !== "object" ||
      !("content" in currentData) ||
      !Array.isArray(currentData.content))
  ) {
    return rejectRequest("currentData must contain native Puck content.", 400);
  }
  const modeRequest = z
    .object({
      mode: z.enum(["prepare", "create", "plan", "section"]).optional(),
      preparation: generationPreparationSchema.optional(),
      selectedComponentId: z.string().min(1).nullable().optional(),
      task: sectionEditTaskSchema.optional(),
      sharedIntent: z.string().optional(),
      validationFeedback: z
        .string()
        .max(GENERATION_REPAIR_FEEDBACK_MAX_CHARACTERS)
        .optional(),
    })
    .passthrough()
    .safeParse(payload);
  if (!modeRequest.success) {
    return rejectRequest(
      "Invalid generation mode or edit request context.",
      400
    );
  }
  const mode = modeRequest.data.mode ?? "create";
  if ((mode === "plan" || mode === "section") && currentData === undefined) {
    return rejectRequest(
      "Follow-up requests require the latest currentData.",
      400
    );
  }
  if (mode === "section" && !modeRequest.data.task) {
    return rejectRequest("A section task is required.", 400);
  }
  if (
    (mode === "create" || mode === "prepare") &&
    !isBlankGenerationPage(
      (currentData as Content | undefined) ?? { content: [] }
    )
  ) {
    return rejectRequest(
      "Generation requires a blank page. Clear the layout before generating a new page.",
      409
    );
  }
  return { messages, layoutId, currentData, mode, context: modeRequest.data };
};

export type ValidatedGenerationRequest = ReturnType<
  typeof validateGenerationRequest
>;
