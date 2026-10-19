export const GENERATION_ATTEMPT_DEADLINE_MS = 5 * 60_000;
export const FRESH_PAGE_OUTPUT_TOKEN_BUDGET = 128_000;
export const GENERATION_PREPARATION_OUTPUT_TOKEN_BUDGET = 2_048;
export const EDIT_PLANNING_OUTPUT_TOKEN_BUDGET = 16_384;
export const SECTION_EDIT_OUTPUT_TOKEN_BUDGET = 32_768;
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
      if (length < 4_096 || length % 256 !== 0) {
        continue;
      }
      for (let period = 24; period <= 256; period++) {
        const repetitions = Math.max(32, Math.ceil(4_096 / period));
        const span = period * repetitions;
        if (tail.length < span) {
          continue;
        }
        const block = tail.slice(-period);
        if (tail.slice(-span) === block.repeat(repetitions)) {
          throw new Error(
            "Generation stopped because the model repeated text excessively inside a string. Try the request again."
          );
        }
      }
    }
  };
};
