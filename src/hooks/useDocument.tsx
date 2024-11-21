import * as React from "react";

const DocumentContext = React.createContext<any | undefined>(undefined);

const useDocument = <T,>(): T => {
  const context = React.useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within VisualEditorProvider");
  }

  return context as T;
};

export { useDocument, DocumentContext };
