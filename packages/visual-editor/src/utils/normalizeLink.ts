import { LinkType } from "@yext/pages-components";

// Includes letters, numbers, and: ( ) [ ] _ ~ : @ ; = / $ * - . & ? # %
const NON_LINK_CHAR_PATTERN = /[^\p{L}\p{N}()_[\]~:@;=/$*+\-.&?#%]+/gu;

// Replacement Pattern for white spaces in links.
const SPACE_REPLACEMENT_PATTERN = /\s+/g;

// Replacement Pattern for repeating "-" in links.
const REPEATED_HYPHEN_CHAR_REPLACEMENT_PATTERN = /(--+)/g;

// Replacement Pattern for dangling "-" in links.
const DANGLING_HYPHEN_CHAR_REPLACEMENT_PATTERN =
  /(?<=[\p{L}\p{N}])-+(?=($|\/))/gu;

/**
 * Normalizes the provided content by converting upper-case ones to lower case,
 * replacing white spaces with a "-" and stripping all other illegal characters.
 * Does not normalize links for EMAIL and PHONE link types.
 */
export const normalizeLink = (
  content?: string,
  linkType?: LinkType
): string => {
  if (!content) {
    return "";
  }

  if (linkType === "EMAIL" || linkType === "PHONE") {
    return content;
  }

  let normalized = content.toLowerCase();
  normalized = normalized.trim();

  normalized = normalized.replace(SPACE_REPLACEMENT_PATTERN, "-");
  normalized = normalized.replace(NON_LINK_CHAR_PATTERN, "");
  normalized = normalized.replace(
    REPEATED_HYPHEN_CHAR_REPLACEMENT_PATTERN,
    "-"
  );
  normalized = normalized.replace(DANGLING_HYPHEN_CHAR_REPLACEMENT_PATTERN, "");

  return normalized;
};
