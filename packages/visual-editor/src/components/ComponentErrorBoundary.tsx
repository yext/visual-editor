import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { OctagonX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCommonMessageSenders } from "../internal/hooks/useMessageSenders";
import { useErrorContext } from "../contexts/ErrorContext";

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  isEditing?: boolean;
  resetKeys?: any[];
}

export const ComponentErrorBoundary = ({
  children,
  isEditing = false,
  resetKeys = [],
}: ComponentErrorBoundaryProps) => {
  const { sendError } = useCommonMessageSenders();
  const { incrementErrorCount, decrementErrorCount } = useErrorContext();
  const [hasError, setHasError] = React.useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (hasError) {
      incrementErrorCount();
    }

    return () => {
      if (hasError) {
        decrementErrorCount();
      }
    };
  }, [hasError, incrementErrorCount, decrementErrorCount]);

  const handleError = (error: Error, info: React.ErrorInfo) => {
    sendError({
      payload: { error, info },
    });
    setHasError(true);
  };

  const handleReset = () => {
    setHasError(false);
  };

  // We stringify the props to ensure we only reset when the values change, not the object reference.
  // We also exclude the `puck` prop which is unstable and causes unnecessary resets.
  const stableResetKeys = resetKeys.map((key) => {
    if (key && typeof key === "object" && Object.hasOwn(key, "puck")) {
      const rest = { ...key };
      delete rest.puck;
      try {
        return JSON.stringify(rest);
      } catch {
        return key;
      }
    }
    return key;
  });

  return (
    <ErrorBoundary
      onError={handleError}
      onReset={handleReset}
      resetKeys={stableResetKeys}
      fallbackRender={() => {
        if (!isEditing) {
          return null;
        }

        return (
          <div className="bg-gray-100 rounded-lg p-2 flex flex-row items-center justify-center gap-4">
            <OctagonX className="w-10 h-10 text-gray-300 flex-shrink-0" />
            <div className="flex flex-col">
              <h3 className="font-medium text-gray-500">
                {t("componentErrorBoundary.error", "Error")}
              </h3>
              <p className="text-gray-500 text-sm">
                {t(
                  "componentErrorBoundary.message",
                  "Can't render this section. Try updating your component library."
                )}
              </p>
            </div>
          </div>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
