import { createContext, ReactNode, useContext } from "react";
type BackgroundColor = {
  selectedColor: string;
  contrastingColor: string;
  isDarkColor: boolean;
};

const BackgroundContext = createContext<BackgroundColor | undefined>(undefined);

export const useBackground = () => useContext(BackgroundContext);

export const BackgroundProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: BackgroundColor;
}) => {
  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};
