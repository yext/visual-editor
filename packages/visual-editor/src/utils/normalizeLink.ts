// Includes letters, numbers, and: ( ) [ ] _ ~ : @ ; = / $ * - . & ? #
const NON_LINK_CHAR_PATTERN = /[^\p{L}\p{N}()_[\]~:@;=/$*+\-.&?#]+/gu;

// Replacement Pattern for white spaces in links.
const SPACE_REPLACEMENT_PATTERN = /\s+/g;

// Replacement Pattern for repeating "-" in links.
const REPEATED_HYPHEN_CHAR_REPLACEMENT_PATTERN = /(--+)/g;

// Replacement Pattern for dangling "-" in links.
const DANGLING_HYPHEN_CHAR_REPLACEMENT_PATTERN =
  /(?<=[\p{L}\p{N}])-+(?=($|\/))/gu;

/**
 * Normalizes content for a URL link.
 * Keeps '?' and other protocol-friendly characters while cleaning up spaces.
 */
export const normalizeLink = (content: string): string => {
  if (content == null) {
    throw new Error("Content cannot be null");
  }

  if (content === "") {
    return content;
  }

  let normalized = content.toLowerCase();
  normalized = normalized.trim();

  normalized = normalized.replace(SPACE_REPLACEMENT_PATTERN, "-");
  normalized = normalized.replace(
    REPEATED_HYPHEN_CHAR_REPLACEMENT_PATTERN,
    "-"
  );
  normalized = normalized.replace(DANGLING_HYPHEN_CHAR_REPLACEMENT_PATTERN, "");
  normalized = normalized.replace(NON_LINK_CHAR_PATTERN, "");

  return normalized;
};
