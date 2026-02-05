import React from "react";
import { createUsePuck } from "@puckeditor/core";
import { useErrorContext } from "../../../contexts/ErrorContext.tsx";
import { useTemplateMetadata } from "../../hooks/useMessageReceivers.ts";
import { useDocument } from "../../../hooks/useDocument.tsx";
import {
  getMetaTitleMissingLocales,
  getRelevantLocales,
} from "../../../utils/metaTitleValidation.ts";
import { type YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { type TranslatableString } from "../../../types/types.ts";

const usePuck = createUsePuck();

export const MetaTitleValidationReporter = () => {
  const appState = usePuck((s) => s.appState);
  const templateMetadata = useTemplateMetadata();
  const streamDocument = useDocument();
  const { incrementErrorCount, decrementErrorCount } = useErrorContext();
  const didIncrementRef = React.useRef(false);

  const locales = getRelevantLocales(templateMetadata, streamDocument);
  const titleField = (appState.data.root?.props?.title ??
    appState.data.root?.title) as
    | YextEntityField<TranslatableString>
    | undefined;
  const missingLocales = getMetaTitleMissingLocales(titleField, locales);

  const hasError = missingLocales.length > 0;

  React.useEffect(() => {
    if (hasError && !didIncrementRef.current) {
      incrementErrorCount();
      didIncrementRef.current = true;
    }

    return () => {
      if (didIncrementRef.current) {
        decrementErrorCount();
        didIncrementRef.current = false;
      }
    };
  }, [hasError, incrementErrorCount, decrementErrorCount]);

  return null;
};
