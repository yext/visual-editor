import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export type ErrorSource = "component" | "metaTitle" | (string & {});

interface ErrorContextType {
  errorCount: number;
  errorSources: ErrorSource[];
  incrementErrorCount: (source?: ErrorSource) => void;
  decrementErrorCount: (source?: ErrorSource) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errorCounts, setErrorCounts] = useState<
    Partial<Record<ErrorSource, number>>
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

  return (
    <ErrorContext.Provider
      value={{
        errorCount,
        errorSources,
        incrementErrorCount,
        decrementErrorCount,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useErrorContext must be used within an ErrorProvider");
  }
  return context;
};
