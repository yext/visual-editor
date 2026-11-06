import React, { createContext, useState, useMemo, useContext } from "react";
import { LayoutGenerationChatUiContext } from "../internal/layoutGeneration/chat/contexts.tsx";

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
  const isGenerationActive =
    useContext(LayoutGenerationChatUiContext)?.chat.isGeneratingPage ?? false;
  const generationActiveRef = React.useRef(isGenerationActive);
  React.useLayoutEffect(() => {
    generationActiveRef.current = isGenerationActive;
  }, [isGenerationActive]);
  const [sharedCardProps, setSharedCardProps] = useState<T | undefined>(
    undefined
  );
  // Mounted cards normally publish and propagate styles from effects. During
  // generation those writes would race the canvas and invalidate manual backups.
  const updateSharedCardProps = React.useCallback<
    React.Dispatch<React.SetStateAction<T | undefined>>
  >((update) => {
    if (!generationActiveRef.current) setSharedCardProps(update);
  }, []);
  React.useEffect(() => {
    if (isGenerationActive) setSharedCardProps(undefined);
  }, [isGenerationActive]);

  const contextValue = useMemo(
    () => ({
      sharedCardProps: isGenerationActive ? undefined : sharedCardProps,
      setSharedCardProps: updateSharedCardProps,
    }),
    [sharedCardProps, isGenerationActive, updateSharedCardProps]
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
