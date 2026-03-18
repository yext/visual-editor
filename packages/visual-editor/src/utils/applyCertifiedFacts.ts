import { StreamDocument } from "./types/StreamDocument.ts";

/**
 * Applies the brand certified facts script to the head of the page.
 *
 * @param document - The stream document that may contain certified facts data
 * @returns The certified facts script HTML string, or undefined if not applicable
 */
export const applyCertifiedFacts = (
  document: StreamDocument
): string | undefined => {
  // Certified facts are provided in document.__certified_facts
  // when includeBrandCertifiedFacts is set to true in the stream configuration
  const certifiedFacts = document?.__certified_facts;

  if (!certifiedFacts) {
    return undefined;
  }

  // The certified facts script embeds the digitally signed facts in JSON-LD format
  // and references the schema at https://yext.com/.well-known/certified-fact/core-snapshot/1/schema.json
  let certifiedFactsJson: string;
  try {
    certifiedFactsJson = JSON.stringify(certifiedFacts);
  } catch (error) {
    console.error("Failed to stringify certified facts data:", error);
    return undefined;
  }

  return `<script type="application/ld+json">${certifiedFactsJson}</script>`;
};
