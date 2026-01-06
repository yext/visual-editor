import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useCommonMessageSenders } from "../internal/hooks/useMessageSenders";
import { useErrorContext } from "../contexts/ErrorContext";

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  isEditing?: boolean;
}

export const ComponentErrorBoundary = ({
  children,
  componentName,
  isEditing = false,
}: ComponentErrorBoundaryProps) => {
  const { sendError } = useCommonMessageSenders();
  const { incrementErrorCount, decrementErrorCount } = useErrorContext();

  const handleError = (error: Error, info: React.ErrorInfo) => {
    sendError({
      payload: { error, info },
    });
    incrementErrorCount();
  };

  const handleReset = () => {
    decrementErrorCount();
  };

  return (
    <ErrorBoundary
      onError={handleError}
      onReset={handleReset}
      fallbackRender={() => {
        if (!isEditing) {
          return null;
        }

        return (
          <div className="p-4 border border-red-500 bg-red-50 text-red-900">
            <h3 className="font-bold mb-2">
              Error in {componentName || "Component"}
            </h3>
            <pre className="text-sm overflow-auto max-h-40 mb-4 whitespace-pre-wrap">
              {
                "There is a bug preventing this component from rendering. Try updating if an update is available, otherwise reach out to support. Publishing has been disabled."
              }
            </pre>
          </div>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
