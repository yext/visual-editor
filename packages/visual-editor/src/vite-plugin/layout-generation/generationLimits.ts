import type { GeneratedContent } from "../../local-editor/types.ts";

export const GENERATION_ATTEMPT_DEADLINE_MS = 120_000;
export const FRESH_PAGE_OUTPUT_TOKEN_BUDGET = 128_000;
export const EDIT_PAGE_OUTPUT_TOKEN_BUDGET = 65_536;

/** Conservative UTF-8 estimate, without adding a model-specific tokenizer. */
export const generationTokenBudget = (
  content?: GeneratedContent,
  options: { isBlankPage?: boolean } = {}
) => {
  const estimatedTokens = content
    ? Math.ceil(Buffer.byteLength(JSON.stringify(content), "utf8") / 3)
    : 0;
  // Empty scaffolding says nothing about the size of a complete page response.
  // max_output_tokens also covers reasoning, so reserve a larger creation budget.
  const minimum =
    options.isBlankPage || !content?.content.length
      ? FRESH_PAGE_OUTPUT_TOKEN_BUDGET
      : EDIT_PAGE_OUTPUT_TOKEN_BUDGET;
  return Math.max(minimum, estimatedTokens * 2 + 4_096);
};

/** Look only within JSON strings, so repeated component structures are safe. */
export const createGenerationRepetitionGuard = () => {
  let inString = false;
  let escaped = false;
  let tail = "";
  let length = 0;
  return (delta: string) => {
    for (const char of delta) {
      if (!inString) {
        if (char === '"') {
          inString = true;
          tail = "";
          length = 0;
        }
        continue;
      }
      if (!escaped && char === '"') {
        inString = false;
        continue;
      }
      escaped = !escaped && char === "\\";
      tail = (tail + char).slice(-8_192);
      length++;
      if (length < 4_096 || length % 256 !== 0) continue;
      for (let period = 24; period <= 256; period++) {
        const repetitions = Math.max(32, Math.ceil(4_096 / period));
        const span = period * repetitions;
        if (tail.length < span) continue;
        const block = tail.slice(-period);
        if (tail.slice(-span) === block.repeat(repetitions))
          throw new Error(
            "Generation stopped because the model repeated text excessively inside a string. Try the request again."
          );
      }
    }
  };
};
