import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export type ErrorSource = "component" | "metaTitle" | (string & {});

export type ErrorDetail = {
  missingLocales?: string[];
  message?: string;
  [key: string]: unknown;
};

interface ErrorContextType {
  errorCount: number;
  errorSources: ErrorSource[];
  errorDetails: Partial<Record<ErrorSource, ErrorDetail>>;
  incrementErrorCount: (source?: ErrorSource) => void;
  decrementErrorCount: (source?: ErrorSource) => void;
  setErrorDetails: (source: ErrorSource, details: ErrorDetail) => void;
  clearErrorDetails: (source: ErrorSource) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errorCounts, setErrorCounts] = useState<
    Partial<Record<ErrorSource, number>>
  >({});
  const [errorDetails, setErrorDetailsState] = useState<
    Partial<Record<ErrorSource, ErrorDetail>>
  >({});

  const incrementErrorCount = useCallback(
    (source: ErrorSource = "component") => {
      setErrorCounts((prev) => ({
        ...prev,
        [source]: (prev[source] ?? 0) + 1,
      }));
    },
    []
  );

  const decrementErrorCount = useCallback(
    (source: ErrorSource = "component") => {
      setErrorCounts((prev) => {
        const current = prev[source] ?? 0;
        const next = Math.max(0, current - 1);
        if (next === 0) {
          const nextCounts = { ...prev };
          delete nextCounts[source];
          return nextCounts;
        }
        return { ...prev, [source]: next };
      });
    },
    []
  );

  const setErrorDetails = useCallback(
    (source: ErrorSource, details: ErrorDetail) => {
      setErrorDetailsState((prev) => ({
        ...prev,
        [source]: details,
      }));
    },
    []
  );

  const clearErrorDetails = useCallback((source: ErrorSource) => {
    setErrorDetailsState((prev) => {
      if (!prev[source]) {
        return prev;
      }
      const nextDetails = { ...prev };
      delete nextDetails[source];
      return nextDetails;
    });
  }, []);

  const errorSources = useMemo(
    () => Object.keys(errorCounts) as ErrorSource[],
    [errorCounts]
  );
  const errorCount = useMemo<number>(() => {
    return Object.values(errorCounts).reduce<number>(
      (sum, value) => sum + (value ?? 0),
      0
    );
  }, [errorCounts]);

  const value = useMemo(
    () => ({
      errorCount,
      errorSources,
      errorDetails,
      incrementErrorCount,
      decrementErrorCount,
      setErrorDetails,
      clearErrorDetails,
    }),
    [
      errorCount,
      errorSources,
      errorDetails,
      incrementErrorCount,
      decrementErrorCount,
      setErrorDetails,
      clearErrorDetails,
    ]
  );

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};

export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useErrorContext must be used within an ErrorProvider");
  }
  return context;
};
