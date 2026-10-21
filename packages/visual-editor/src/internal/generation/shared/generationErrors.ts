import { GENERATION_REPAIR_FEEDBACK_MAX_CHARACTERS } from "../limits.ts";

/** Distinguish repairable model output from failures that stop the turn. */
export class GenerationError extends Error {
  constructor(
    message: string,
    /** Whether invalid output can be repaired once. */
    readonly retryable = false,
    /** Whether the failure must stop outstanding tasks. */
    readonly transport = false,
    /** Validation details for the repair request. */
    readonly feedback = message,
    readonly status?: number
  ) {
    super(message);
  }
}

/** Retry invalid output once with bounded feedback from the preceding attempt. */
export const repairGenerationOutput = async <T>(
  execute: (feedback?: string) => Promise<T>
) => {
  try {
    return await execute();
  } catch (cause) {
    if (!(cause instanceof GenerationError) || !cause.retryable) {
      throw cause;
    }
    return execute(
      cause.feedback.slice(0, GENERATION_REPAIR_FEEDBACK_MAX_CHARACTERS)
    );
  }
};
