import { StreamDocument } from "./applyTheme.ts";

/**
 * Applies the brand certified facts script to the head of the page.
 *
 * @param document - The stream document that may contain certified facts data
 * @returns The certified facts script HTML string, or undefined if not applicable
 */
export const applyCertifiedFacts = (
  document: StreamDocument
): string | undefined => {
  // Certified facts are provided in the document.__certified_facts field
  // when includeBrandCertifiedFacts is set to true in the stream configuration
  const certifiedFacts = document?.__certified_facts;

  if (!certifiedFacts) {
    return undefined;
  }

  // The certified facts script embeds the digitally signed facts in JSON-LD format
  // and references the schema at https://yext.com/.well-known/certified-fact/core-snapshot/1/schema.json
  return `<script type="application/ld+json">${JSON.stringify(certifiedFacts)}</script>`;
};
