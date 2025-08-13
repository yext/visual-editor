import { EnhancedTranslatableCTA } from "../types/types";

/**
 * Helper function to extract CTA data from either nested or direct structure.
 * This handles both the old flat structure and the new nested structure.
 */
export const extractCTA = (
  ctaData:
    | EnhancedTranslatableCTA
    | { cta?: EnhancedTranslatableCTA }
    | undefined
) => {
  if (!ctaData) return null;

  // Check if it's the nested structure
  if ("cta" in ctaData && ctaData.cta) {
    return ctaData.cta;
  }

  // Check if it's the direct structure
  if ("label" in ctaData) {
    return ctaData as EnhancedTranslatableCTA;
  }

  return null;
};
