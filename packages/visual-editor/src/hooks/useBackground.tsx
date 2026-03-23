import React, { createContext, ReactNode, useContext } from "react";
import { ThemeColor } from "../utils/themeConfigOptions.ts";

const BackgroundContext = createContext<Required<ThemeColor> | undefined>(
  undefined
);

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
  value: Required<ThemeColor>;
}) => {
  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};
