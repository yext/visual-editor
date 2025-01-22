import * as React from "react";

const TailwindConfigContext = React.createContext<any | undefined>(undefined);

const useTailwindConfig = <T,>(): T => {
  const context = React.useContext(TailwindConfigContext);
  if (!context) {
    throw new Error(
      "useTailwindConfig must be used within VisualEditorProvider"
    );
  }

  return context as T;
};

export { useTailwindConfig, TailwindConfigContext };
