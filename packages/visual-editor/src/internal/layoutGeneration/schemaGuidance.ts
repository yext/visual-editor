/** Field and schema guidance stays with the code that defines its semantics. */
export const translationModeGuidance =
  "Use translate only with an explicit translation request or approval; otherwise use defaultOnly. defaultOnly changes fallback text and preserves every saved locale override, including copies of the old fallback. translate may update current layout locales only; preserve overrides outside them.";

export const planningDescriptions = {
  reply:
    "User-facing reply addressed directly to you, not an internal summary about the user. Explain unsupported requests without claiming changes were applied.",
  intent:
    "Use content for local edits, including batches with unsupported parts. Use mixed only when local edits also require non-null globalStyleGuidance for a supported manual theme change.",
  clarification:
    "One user-facing question resolving ambiguity between supported actions. A missing capability is a limitation, not a reason to ask for permission.",
  globalStyleGuidance:
    "User-facing guidance for supported global theme settings only. Address you directly; do not include internal notes such as 'The user agreed'. This is advice, not an applied edit.",
  limitations:
    "For batches with supported edits, explain unsupported parts here. This note is retained alongside actual task outcomes; never claim edits succeeded. Use null when there are no limitations or no tasks.",
};

export const mainContentDescription =
  "The main content area, containing page sections in display order, with headers before it and footers after it as page-root siblings.";
