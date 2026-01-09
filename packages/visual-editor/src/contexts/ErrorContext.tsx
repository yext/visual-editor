import React, { createContext, useContext, useState, useCallback } from "react";

interface ErrorContextType {
  errorCount: number;
  incrementErrorCount: () => void;
  decrementErrorCount: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errorCount, setErrorCount] = useState(0);

  const incrementErrorCount = useCallback(() => {
    setErrorCount((prev) => prev + 1);
  }, []);

  const decrementErrorCount = useCallback(() => {
    setErrorCount((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <ErrorContext.Provider
      value={{ errorCount, incrementErrorCount, decrementErrorCount }}
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
