import React from "react";
import { createUsePuck } from "@puckeditor/core";
import { useErrorContext } from "../../../../contexts/ErrorContext.tsx";
import { useDocument } from "../../../../hooks/useDocument.tsx";
import { getPageSetLocales } from "../../../../utils/pageSetLocales.ts";
import { type YextEntityField } from "../../../../editor/YextEntityFieldSelector.tsx";
import { type TranslatableString } from "../../../../types/types.ts";
import { getMetaTitleMissingLocales } from "./metaTitleValidation.ts";

const usePuck = createUsePuck();

export const MetaTitleValidationReporter = () => {
  const appState = usePuck((s) => s.appState);
  const streamDocument = useDocument();
  const {
    incrementErrorCount,
    decrementErrorCount,
    setErrorDetails,
    clearErrorDetails,
  } = useErrorContext();
  const didIncrementRef = React.useRef(false);

  const locales = getPageSetLocales(streamDocument);
  const titleField = (appState.data.root?.props?.title ??
    appState.data.root?.title) as
    | YextEntityField<TranslatableString>
    | undefined;
  const missingLocales = getMetaTitleMissingLocales(titleField, locales);

  const hasError = missingLocales.length > 0;
  const missingLocalesKey = React.useMemo(
    () => missingLocales.join("|"),
    [missingLocales]
  );

  React.useEffect(() => {
    if (hasError && !didIncrementRef.current) {
      incrementErrorCount("metaTitle");
      didIncrementRef.current = true;
    }

    return () => {
      if (didIncrementRef.current) {
        decrementErrorCount("metaTitle");
        didIncrementRef.current = false;
      }
    };
  }, [hasError, incrementErrorCount, decrementErrorCount]);

  React.useEffect(() => {
    if (hasError) {
      setErrorDetails("metaTitle", { missingLocales });
      return;
    }
    clearErrorDetails("metaTitle");
  }, [hasError, missingLocalesKey, setErrorDetails, clearErrorDetails]);

  return null;
};
