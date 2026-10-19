/** Shared policy for preparation, planning, and content generation. */
export const translationModeGuidance =
  "Use defaultOnly unless you have an explicit translation request or approval. defaultOnly changes fallback text only and preserves every saved locale override, even one equal to the old fallback. translate may update the current layout locales; saved overrides outside those locales must always be preserved.";

export const newTextGuidance =
  "New localized text requires defaultValue. In defaultOnly mode, omit all locale overrides, including inherited defaults. In translate mode, populate only current layout locales.";

export const translationDecisionGuidance =
  "Read the complete conversation. An explicit translation request or prior yes/no answer resolves the choice; do not ask again. For new pages with multiple locales and no decision, ask whether to translate before generating anything. For a single locale use defaultOnly unless translations were requested. Preserve the original request after clarification replies.";

export const editTranslationGuidance =
  "The localizedText context lists overrideLocales for each field. Every saved override is explicit content; the application never synchronizes copies of the fallback. If requested copy edits affect a field with current layout locale overrides and no translation decision exists, ask whether to translate them before applying any part of the batch. On refusal, preserve those overrides and explain that they continue to render their previous text. Do not ask about unrelated fields, styling, removals, or reorders. Whole-array replacements must preserve complete override bundles, including duplicates; reordering them is allowed.";
