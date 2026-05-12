import React, { createContext, useState, useMemo, useContext } from "react";

type CardContextType<T extends Record<string, any>> = {
  sharedCardProps: T | undefined;
  setSharedCardProps: React.Dispatch<React.SetStateAction<T | undefined>>;
};

type ParentCardStylesContextType = {
  parentStyles: unknown;
};

const CardContext = createContext<CardContextType<any>>({
  sharedCardProps: undefined,
  setSharedCardProps: () => {},
});
const ParentCardStylesContext = createContext<ParentCardStylesContextType>({
  parentStyles: undefined,
});

export const CardContextProvider = <T extends Record<string, any>>({
  children,
  parentStyles,
}: {
  children: React.ReactNode;
  parentStyles?: unknown;
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
    <ParentCardStylesContext.Provider value={{ parentStyles }}>
      <CardContext.Provider value={contextValue as CardContextType<any>}>
        {children}
      </CardContext.Provider>
    </ParentCardStylesContext.Provider>
  );
};

// Custom hook for consuming the CardWrapperContext with type safety
export const useCardContext = <T extends Record<string, any>>() => {
  return useContext(CardContext) as CardContextType<T>;
};

export const useParentCardStyles = <T,>() => {
  return useContext(ParentCardStylesContext).parentStyles as T | undefined;
};
