import React, { createContext, useState, useMemo, useContext } from "react";

type CardContextType<T extends Record<string, any>> = {
  sharedCardProps: T | undefined;
  setSharedCardProps: React.Dispatch<React.SetStateAction<T | undefined>>;
};

const CardContext = createContext<CardContextType<any>>({
  sharedCardProps: undefined,
  setSharedCardProps: () => {},
});

export const CardContextProvider = <T extends Record<string, any>>({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sharedCardProps, setSharedCardProps] = useState<T | undefined>(
    undefined
  );

  const contextValue = useMemo(
    () => ({
      sharedCardProps,
      setSharedCardProps,
    }),
    [sharedCardProps]
  );

  return (
    <CardContext.Provider value={contextValue as CardContextType<any>}>
      {children}
    </CardContext.Provider>
  );
};

// Custom hook for consuming the CardWrapperContext with type safety
export const useCardContext = <T extends Record<string, any>>() => {
  return useContext(CardContext) as CardContextType<T>;
};
