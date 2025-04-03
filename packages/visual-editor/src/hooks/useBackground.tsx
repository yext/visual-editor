import React, { createContext, ReactNode, useContext } from "react";
import { BackgroundStyle } from "../utils/themeConfigOptions.ts";

const BackgroundContext = createContext<BackgroundStyle | undefined>(undefined);

export const useBackground = () => {
  if (!BackgroundContext) {
    throw new Error(
      "useBackgroundContext must be used within BackgroundProvider"
    );
  }
  return useContext(BackgroundContext);
};

export const BackgroundProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: BackgroundStyle;
}) => {
  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};
