import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { OctagonX } from "lucide-react";
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

  return (
    <ErrorBoundary
      onError={handleError}
      onReset={handleReset}
      resetKeys={resetKeys}
      fallbackRender={() => {
        if (!isEditing) {
          return null;
        }

        return (
          <div className="p-2 bg-white">
            <div className="bg-gray-100 rounded-lg p-2 flex flex-row items-center justify-center gap-4">
              <OctagonX className="w-10 h-10 text-gray-300 flex-shrink-0" />
              <div className="flex flex-col">
                <h3 className="font-medium text-gray-500">Error</h3>
                <p className="text-gray-500 text-sm">
                  Can't render this section. Try updating your component
                  library.
                </p>
              </div>
            </div>
          </div>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
