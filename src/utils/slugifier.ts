// A TypeScript copy of src/com/yext/profiles/slug/Slugifier.java

// A valid slug pattern may contain letters, numbers, and the following characters:
// ( ) [ ] _ ~ : @ ; = / $ * - . &
// The pattern below is the negation of the above.
const ILLEGAL_SLUG_PATTERN = /[^\p{L}\p{N}()_[\]~:@;=/$*+\-.&]+/gu;

// Replacement Pattern for special characters in slug fields.
const SPECIAL_CHAR_REPLACEMENT_PATTERN = /([?#]+)/g;

// Replacement Pattern for white spaces in slug fields.
const SPACE_REPLACEMENT_PATTERN = /\s+/g;

// Replacement Pattern for repeating "-" in slug fields.
const REPEATED_HYPHEN_CHAR_REPLACEMENT_PATTERN = /(--+)/g;

// Replacement Pattern for dangling "-" in slug fields.
const DANGLING_HYPHEN_CHAR_REPLACEMENT_PATTERN =
  /(?<=[\p{L}\p{N}])-+(?=($|\/))/gu;

/**
 * Check that the string is a valid slug.
 *
 * @param content The content to check
 * @return Boolean indicating if it's a valid slug or not
 */
export const validateSlug = (content: string): boolean => {
  if (content == null) {
    throw new Error("Content cannot be null");
  }
  return content !== "" && !ILLEGAL_SLUG_PATTERN.test(content);
};

/**
 * Normalizes the provided content by converting upper-case ones to lower case,
 * replacing white spaces, '?', and '#', with a "-" and stripping all other illegal characters.
 *
 * @param content The content to normalize
 * @return The normalized result
 */
export const normalizeSlug = (content: string): string => {
  if (content == null) {
    throw new Error("Content cannot be null");
  }

  if (content === "") {
    return content;
  }

  let normalized = content.toLowerCase();

  // replace certain special characters with " " and trim
  normalized = normalized.replace(SPECIAL_CHAR_REPLACEMENT_PATTERN, " ");
  normalized = normalized.trim();
  normalized = normalized.replace(SPACE_REPLACEMENT_PATTERN, "-");
  normalized = normalized.replace(
    REPEATED_HYPHEN_CHAR_REPLACEMENT_PATTERN,
    "-"
  );
  normalized = normalized.replace(DANGLING_HYPHEN_CHAR_REPLACEMENT_PATTERN, "");
  normalized = normalized.replace(ILLEGAL_SLUG_PATTERN, "");

  return normalized;
};
