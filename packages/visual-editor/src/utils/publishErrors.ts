import { pt } from "./i18n/platform.ts";
import {
  type ErrorDetail,
  type ErrorSource,
} from "../contexts/ErrorContext.tsx";

const formatLocaleList = (locales: string[]) => locales.join(", ");

const PUBLISH_ERROR_ACTIONS: Record<string, (details?: ErrorDetail) => string> =
  {
    component: () =>
      pt("publishError.components", "delete or fix sections with errors"),
    metaTitle: (details?: ErrorDetail) => {
      const missingLocales = details?.missingLocales ?? [];
      if (missingLocales.length > 0) {
        return pt(
          "publishError.metaTitleWithLocales",
          "fill in Meta Title for the following locales by navigating to the top-level Page component's settings: {{locales}}",
          { locales: formatLocaleList(missingLocales) }
        );
      }
      return pt(
        "publishError.metaTitle",
        "fill in Meta Title for all locales by navigating to the top-level Page component's settings"
      );
    },
  };

const getPublishErrorActions = (
  errorSources: ErrorSource[],
  errorDetails: Partial<Record<ErrorSource, ErrorDetail>>
): string[] => {
  const actions = errorSources
    .map((source) => PUBLISH_ERROR_ACTIONS[source]?.(errorDetails[source]))
    .filter((action): action is string => Boolean(action));

  return Array.from(new Set(actions));
};

export const getPublishErrorMessage = (
  errorSources: ErrorSource[] = [],
  errorDetails: Partial<Record<ErrorSource, ErrorDetail>> = {}
): string => {
  const actions = getPublishErrorActions(errorSources, errorDetails);
  const actionsText =
    actions.length > 0
      ? actions.join("; ")
      : pt(
          "resolveErrorsInEditor",
          "resolve the errors highlighted in the editor"
        );

  return pt("fixErrorsToPublish", "To publish, {{actions}}", {
    actions: actionsText,
  });
};
