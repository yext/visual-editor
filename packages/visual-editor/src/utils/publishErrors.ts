import { pt } from "./i18n/platform.ts";
import { type ErrorSource } from "../contexts/ErrorContext.tsx";

const PUBLISH_ERROR_ACTIONS: Record<string, () => string> = {
  component: () =>
    pt("publishError.components", "delete or fix sections with errors"),
  metaTitle: () =>
    pt("publishError.metaTitle", "fill in Meta Title for all locales"),
};

const getPublishErrorActions = (errorSources: ErrorSource[]): string[] => {
  const actions = errorSources
    .map((source) => PUBLISH_ERROR_ACTIONS[source]?.())
    .filter((action): action is string => Boolean(action));

  return Array.from(new Set(actions));
};

export const getPublishErrorMessage = (
  errorSources: ErrorSource[] = []
): string => {
  const actions = getPublishErrorActions(errorSources);

  if (actions.length === 0) {
    return pt(
      "fixErrorsToPublish",
      "To publish, resolve the errors highlighted in the editor."
    );
  }

  if (actions.length === 1) {
    return pt("fixErrorsToPublishSingle", "To publish, {{action}}.", {
      action: actions[0],
    });
  }

  return pt("fixErrorsToPublishMultiple", "To publish, {{actions}}.", {
    actions: actions.join("; "),
  });
};
